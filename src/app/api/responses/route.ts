import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Answers } from '@/types/survey';

// POST: Response作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { purposeId, clientId, respondentName, answers } = body;

    if (!purposeId || !answers) {
      return NextResponse.json(
        { error: 'PurposeId and answers are required' },
        { status: 400 }
      );
    }

    // 同じclientIdからの重複回答をチェック
    if (clientId) {
      const existing = await prisma.response.findUnique({
        where: {
          purposeId_clientId: {
            purposeId,
            clientId,
          },
        },
      });

      if (existing) {
        // 既存の回答を更新
        const response = await prisma.response.update({
          where: {
            id: existing.id,
          },
          data: {
            respondentName,
            answers,
          },
        });

        return NextResponse.json(response);
      }
    }

    // 新規回答を作成
    const response = await prisma.response.create({
      data: {
        purposeId,
        clientId,
        respondentName,
        answers,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to create response:', error);
    return NextResponse.json(
      { error: 'Failed to create response' },
      { status: 500 }
    );
  }
}
