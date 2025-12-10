import { Question, PurposeInput, AISummary, Answers } from '@/types/survey';
import { createLLMProvider } from './llm';

/**
 * 目的からアンケート質問を自動生成
 */
export async function generateQuestions(input: PurposeInput): Promise<Question[]> {
  const llm = createLLMProvider();

  const prompt = `あなたは優秀なアンケート設計者です。以下の目的に基づいて、適切なアンケート質問を生成してください。

目的: ${input.title}
詳細: ${input.description}

以下の要件を満たす質問を3〜10個生成してください：
1. 目的達成に必要な情報を収集できる質問
2. 回答者にとって答えやすい質問
3. 適切な質問形式を選択（単一選択、複数選択、自由記述、数値、日付など）

質問形式の種類：
- single_choice: 単一選択（options必須）
- multi_choice: 複数選択（options必須）
- text: 自由記述
- number: 数値入力
- date: 日付選択
- scale: スケール（1-5など、options必須）
- rating: 評価（1-5星など、options必須）
- range: 範囲選択
- tags: タグ選択（options必須）

以下のJSON形式で回答してください：
[
  {
    "id": "q1",
    "label": "質問文",
    "type": "質問形式",
    "options": ["選択肢1", "選択肢2"],
    "required": true
  }
]

JSON以外は出力しないでください。`;

  const response = await llm.generateText(prompt, {
    temperature: 0.7,
    maxTokens: 4096,
  });

  // JSONを抽出（マークダウンコードブロックを除去）
  let jsonText = response.content.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
  }

  const questions = JSON.parse(jsonText) as Question[];
  return questions;
}

/**
 * 回答データから要約とインサイトを生成
 */
export async function generateSummary(
  purpose: PurposeInput,
  questions: Question[],
  answers: Answers[]
): Promise<AISummary> {
  const llm = createLLMProvider();

  // 質問と回答を整形
  const questionsText = questions
    .map((q, i) => `質問${i + 1}: ${q.label} (形式: ${q.type})`)
    .join('\n');

  const answersText = answers
    .map((respondentAnswers, i) => {
      const responseText = respondentAnswers
        .map((answer) => {
          const question = questions.find((q) => q.id === answer.questionId);
          let valueText = '';
          if (answer.value === null) {
            valueText = '未回答';
          } else if (Array.isArray(answer.value)) {
            valueText = answer.value.join(', ');
          } else if (typeof answer.value === 'object' && 'min' in answer.value) {
            valueText = `${answer.value.min} - ${answer.value.max}`;
          } else {
            valueText = String(answer.value);
          }
          return `  ${question?.label}: ${valueText}`;
        })
        .join('\n');
      return `回答者${i + 1}:\n${responseText}`;
    })
    .join('\n\n');

  const prompt = `あなたは優秀なデータアナリストです。以下のアンケート結果を分析し、要約と推奨アクションを生成してください。

目的: ${purpose.title}
詳細: ${purpose.description}

質問一覧:
${questionsText}

回答データ (全${answers.length}件):
${answersText}

以下の2つを生成してください：
1. insights: 回答データから読み取れる傾向、条件、制約などを5〜10行で要約
2. recommendations: 目的達成のための具体的な推奨アクション（店舗タイプ、プラン案、必要な準備など）を3〜5つ列挙

以下のJSON形式で回答してください：
{
  "insights": "要約文...",
  "recommendations": "推奨アクション文..."
}

JSON以外は出力しないでください。`;

  const response = await llm.generateText(prompt, {
    temperature: 0.7,
    maxTokens: 4096,
  });

  // JSONを抽出
  let jsonText = response.content.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
  }

  const summary = JSON.parse(jsonText) as AISummary;
  return summary;
}
