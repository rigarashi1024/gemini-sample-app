// 質問形式の種類
export type QuestionType =
  | 'single_choice'    // 単一選択
  | 'multi_choice'     // 複数選択
  | 'text'             // 自由記述
  | 'number'           // 数値入力
  | 'date'             // 日付選択
  | 'scale'            // スケール（1-5など）
  | 'rating'           // 評価（星など）
  | 'range'            // 範囲選択
  | 'tags';            // タグ選択

// 質問の定義
export type Question = {
  id: string;          // 一意となるID
  label: string;       // 質問内容
  type: QuestionType;  // 質問形式
  options?: string[];  // 選択肢（choice系でのみ使用）
  required: boolean;   // 必須の質問か
}

// 回答値の型（質問タイプによって異なる）
export type AnswerValue =
  | string              // single_choice, text, date
  | string[]            // multi_choice, tags
  | number              // number, scale, rating
  | { min: number; max: number }  // range
  | null;               // 未回答

// 回答の定義
export type Answer = {
  questionId: string;   // 質問のID
  value: AnswerValue;   // 回答値
}

// 回答一覧（配列）
export type Answers = Answer[];

// AI生成用の型
export type PurposeInput = {
  title: string;
  description: string;
}

// AI要約結果
export type AISummary = {
  insights: string;        // 要約・インサイト
  recommendations: string; // 推奨アクション
}
