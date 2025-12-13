import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSummary } from '@/lib/ai';
import { Question, Answers } from '@/types/survey';

// GET: Purpose分析（集計 + AI要約）
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const purpose = await prisma.purpose.findUnique({
      where: {
        id: params.id,
      },
      include: {
        responses: true,
      },
    });

    if (!purpose) {
      return NextResponse.json(
        { error: 'Purpose not found' },
        { status: 404 }
      );
    }

    const questions = purpose.questions as Question[];
    const allAnswers = purpose.responses.map((r) => r.answers as Answers);

    // 集計データ作成
    const aggregation = questions.map((question) => {
      const answers = allAnswers
        .map((responseAnswers) =>
          responseAnswers.find((a) => a.questionId === question.id)
        )
        .filter((a) => a && a.value !== null);

      let summary: any = {
        questionId: question.id,
        label: question.label,
        type: question.type,
        totalResponses: answers.length,
      };

      // 質問タイプに応じた集計
      if (
        question.type === 'single_choice' ||
        question.type === 'multi_choice' ||
        question.type === 'tags'
      ) {
        // 選択肢ごとのカウント
        const counts: Record<string, number> = {};
        answers.forEach((answer) => {
          const values = Array.isArray(answer!.value)
            ? answer!.value
            : [answer!.value];
          values.forEach((val) => {
            counts[val as string] = (counts[val as string] || 0) + 1;
          });
        });
        summary.distribution = counts;
      } else if (
        question.type === 'number' ||
        question.type === 'scale' ||
        question.type === 'rating'
      ) {
        // 数値の統計
        const numbers = answers.map((a) => a!.value as number);
        summary.min = Math.min(...numbers);
        summary.max = Math.max(...numbers);
        summary.average =
          numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
      } else if (question.type === 'text') {
        // 自由記述一覧
        summary.responses = answers.map((a) => a!.value);
      } else if (question.type === 'date') {
        // 日付の分布
        summary.dates = answers.map((a) => a!.value);
      } else if (question.type === 'range') {
        // 範囲の統計
        summary.ranges = answers.map((a) => a!.value);
      }

      return summary;
    });

    // AI要約生成
    let aiSummary = null;
    if (allAnswers.length > 0) {
      try {
        aiSummary = await generateSummary(
          {
            title: purpose.title,
            description: purpose.description,
          },
          questions,
          allAnswers
        );
      } catch (error) {
        console.error('Failed to generate AI summary:', error);
      }
    }

    return NextResponse.json({
      purpose: {
        id: purpose.id,
        title: purpose.title,
        description: purpose.description,
        deadline: purpose.deadline,
        shareToken: purpose.shareToken,
      },
      aggregation,
      aiSummary,
      totalResponses: purpose.responses.length,
    });
  } catch (error) {
    console.error('Failed to analyze purpose:', error);
    return NextResponse.json(
      { error: 'Failed to analyze purpose' },
      { status: 500 }
    );
  }
}
