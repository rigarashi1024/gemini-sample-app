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

【重要】アンケート生成に関する制約（集計可能性を保証するためのルール）：

1. 集計可能な形式を必須とする
   - 基本的にtext型の質問は避け、可能な限り選択肢形式（single_choice / multi_choice / range / number / scale）で生成すること
   - 数値や予算に関する質問では、明確な範囲（例：1000–1500円、1500–2000円）を複数提示し、その中から選べる形式にすること
   - 「その他」を許可する場合はoptionsの最後に"その他"を含めること

2. 選択肢は互いに排他的かつ重複しないように設計する
   - 例：「1000円〜2000円」「2000円〜3000円」など境界が重複しないようにする
   - あいまいな文言（「安め」「高め」など）は禁止し、必ず定量的な表現にすること

3. 選択肢の粒度は目的に応じて適切にそろえる
   - 例：予算に関する選択肢は3〜6個程度に絞る（数が多すぎると集計が困難になるため）

4. 選択肢には必ず「その他」「特に希望なし」などの選択なしの回答を必ず用意すること
   - 質問の内容に応じて適切な表現を選択すること（例：「その他」「特になし」「どちらでもよい」「該当なし」など）
   - この選択肢は必ずoptionsの最後に配置すること

5. Yes/Noの二択問題は明確にYes/Noとして生成する
   - 「たぶん」「どちらともいえない」など曖昧な選択肢を追加する場合は、意味が明確になるように名称を統一する

6. Questions JSONの仕様に完全準拠した出力を行う
   - 型のブレ（例：数値を文字列で返す/id欠落）を禁止する
   - idはすべてユニークな文字列を生成すること（例：q1, q2, q3...）

7. 集計が困難になる質問形式は禁止する
   - あいまいな自由記述を前提とした質問
   - 選択肢の意味が曖昧・重複している質問
   - 設問意図が不明確な質問（例：「どう思いますか？」など）

8. text型が必要な質問を作成する場合
   - その質問は「集計対象外」として扱う前提で作成し、text型の質問を多用しないこと

9. 質問生成時、ユーザー入力に明示的な地名が含まれない限り、特定の地域名（例：渋谷、新宿、梅田など）を質問文に挿入してはならない

10. 「場所」「エリア」に関する項目を作成する場合は、原則としてtext（自由入力）または大分類の選択肢+自由入力を使用し、具体的な地名を固定した選択肢を生成しないこと

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

  try {
    const questions = JSON.parse(jsonText) as Question[];
    if (!Array.isArray(questions)) {
      console.error('LLM response is not an array:', jsonText);
      throw new Error('Invalid response format: expected an array of questions');
    }
    return questions;
  } catch (error) {
    console.error('Failed to parse LLM response as JSON:', jsonText);
    console.error('Parse error:', error);
    throw new Error('Failed to generate questions: Invalid JSON response from LLM');
  }
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
