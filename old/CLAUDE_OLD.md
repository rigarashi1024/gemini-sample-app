# CLAUDE.md

## 1. プロジェクト概要（汎用版）

- プロジェクト名（仮）: PurposeSurvey
- 目的:
  - 「ユーザーが任意の目的を入力すると、その目的を達成するために必要な情報を収集するアンケートを AI が自動生成し、回答を収集・集計し、さらに AI が目的達成に向けた推奨（例：お店候補・アイテムの選択・活動プラン）を返す Web アプリケーション」を構築する。

- 想定目的の例（あくまで例であり限定しない）:
  - 0次会の店探し
  - チームランチの店決め
  - 旅行プラン作成の事前ヒアリング
  - 新規プロジェクトのキックオフアンケート
  - イベント（忘年会・歓迎会・飲み会・合宿）の希望調査
  - 商品選択のための希望調査
  - 採用候補者の事前ヒアリング
  - など、**「目的達成のために参加者の条件・嗜好・制約を集める必要がある」全て**

このアプリは「目的 → アンケート生成 → 回答収集 → 集計 → 推奨」が自動で行われる汎用エージェントサービスを目指す。

---

## 2. 対象ユーザー

- 一般ユーザー（飲み会・旅行など）
- 小規模チームの調整役（イベント企画・日程調整）
- 企業の幹事・イベント担当者
- プロジェクトマネージャー
- 調査目的のユーザー
- **誰でも “目的に応じた情報収集を簡単にしたい人” が対象**

---

## 3. スコープ（POC / MVP）

### 3-1. 今回実装する POC 機能（汎用）

1. **目的入力フォーム**
   - ユーザーは自由な文章で目的・状況を説明する。

2. **AI によるアンケート自動生成（汎用）**
   - 目的を解析し、回答者から収集すべき情報を AI が判断し、
     質問スキーマを 3〜10 個ほど生成する。

3. **回答用 URL の作成**
   - イベントではなく「目的単位」で回答URLを発行する。
   - LINE / Slack などでシェア可能。

4. **回答フォーム**
   - 生成された質問に対応した動的フォームをレンダリングし、
     回答をDBに保存する。

5. **回答の集計**
   - 質問ごとに以下を提供:
     - 選択肢ごとの件数・割合
     - 自由回答の一覧

6. **AI による要約 / インサイト生成**
   - 回答を解析し、目的達成に必要な条件・傾向を短文でまとめる。

7. **AI による推奨アクション生成**
   - 場合に応じて、以下を生成できる柔軟な仕組みを目指す：
     - 店のタイプの候補（ジャンル、雰囲気、予算帯）
     - プラン案（旅行であれば候補地、時間配分）
     - 物品候補（イベント準備なら必要機材）
     - 条件に合う要素のリストアップ

※ POCでは **実際の外部API連携（Google Maps検索など）は行わず、テキストベースで候補を提示する**。

---

### 3-2. POC で実装しないもの（固定）

- 認証（Google/LINEログイン）
- 店検索API / 外部データAPIへの接続（Google Maps 等）
- マルチテナント
- 役割管理（閲覧制限）
- 通知機能（メール・LINE）
- 高度なレポート生成
- 組織レベルでの利用
- 高度デザイン（最低限でOK）

---

## 4. 技術スタック（共通）

- フロント: **Next.js 14（App Router）**
- スタイリング: **TailwindCSS**
- UI: **shadcn/ui**
- バックエンド: Next.js Route Handlers
- DB: Supabase（PostgreSQL）
- ORM: Prisma
- AI:
  - 実装AI: Claude
  - サブエージェント（レビュー等）: Gemini 3 Pro
- デプロイ: Vercel（任意）

---

## 5. データモデル（汎用化版）

- 以下テーブルとテーブル内で使用するJSONを並列に表現する

### テーブル定義

#### Purpose（アンケートを作成するベースとなる目的）

- `id: string` - 一意となるID
- `title: string` — ユーザーが入力したタイトル
- `description: string` — ユーザーが入力した目的
- `questions: Json` - descriptionをベースに作成された質問、フォーマットについては後述するJSON定義に詳細記述
- `shareToken: string` - URL用のランダムトークン
- `deadline: Datetime | null` - アンケートの締切日
- `createdAt: Datetime` - レコードの作成日
- `updatedAt: Datetime` - レコードの更新日（初回はcreatedAtと同じDatetimeを保存）

#### Response（アンケートの回答）

- `id: string` - 一意となるID
- `purposeId: string` - 本レコードと紐づく `Purpose` テーブルレコードのID
- `clientId: string | null`
- `respondentName: string | null`
- `answers: Json` - 質問への回答一覧、フォーマットについては後述するJSON定義に詳細記述
- `createdAt: Datetime` - レコードの作成日
- `updatedAt: Datetime` - レコードの更新日（初回はcreatedAtと同じDatetimeを保存）

### JSON定義

#### Question

```ts
    type Question = {
        "id": string, // 一意となるID 
        "label": string, // 質問内容
        "type": QuestionType // 質問形式、具体的な形式については後述するJSON定義に詳細記述
        "options": list[string | int | number | datetime | null], // 選択肢、質問形式によって何が入るかは変化
        "required": boolean // 必須の質問か
    }
```

#### Questions

```ts
    type Questions = Question[]
```

#### QuestionType

```ts
    type QuestionType = 
        | "single_choice", // 単一選択
        | "multi_choice", // 複数選択
        | "text" , // 自由入力
        | "scale", // 1〜5の評価・満足度
        | "number", // 数値入力（予算・人数など）
        | "date", // 日付（スケジュール提案用）
        | "range", // 最小〜最大（予算帯など）
        | "rating", // 星評価（★1〜★5）
        | "tags" // キーワード複数入力
```

### Answers

```ts
    type Answers = {
        [questionId: string]: AnswerValue;
    };
```

### Answer

```ts
    type AnswerValue = 
    | int // scale, number
    | number // rating
    | [int|null, int|null] // range
    | string // text
    | string[] // single_choice, multi_choice, tags
    | datetime[] // date

```

---

## 6. 画面構成（汎用）

### 1. トップページ

- 「目的を入力してアンケートを自動生成」ボタン
  - クリック後に目的作成ページに遷移
- AI生成したアンケートのタイトル
  - タイトルにはアンケート確認・編集ページへの遷移URLが埋め込まれている
  - 生成したアンケートが存在しない場合は表示しない
- 生成したアンケートのタイトル横に「共有用URLをコピー」ボタン
  - ページ生成時に`Purpose`レコードの`shareToken`をベースに共有用URLを生成しておく
  - ページ遷移時に`purposeId`を送信する
  - クリック時、上記で生成済みの共有用URLをクリップボードに保存
- 「集計内容を確認」ボタン
  - クリック後に集計・AI解析ページに遷移

### 2. 目的作成ページ

- タイトル
- 説明（自由入力）
- 「AIでアンケート生成」ボタン
  - クリック時にアンケート確認・編集ページに遷移
  - クリックした段階では`Purpose`レコードは作成しない
  - クリック時に入力した情報をオブジェクトとしてまとめて次ページに送る

### 3.アンケート確認・編集ページ

- タイトル
  - `Purpose`レコードの`title`を表示
- AI生成したアンケート内容
  - AI生成された項目に期限(deadline)がない場合は非必須の項目として追加する
  - アンケート内容はユーザーが更新できるような状態にする
- ページ下部に「アンケート再生成」
  - クリック後にアンケートの再生成を行う
- ページ下部に「保存ボタン」
  - クリック後にトップページに遷移
  - 入力した内容を基に`Purpose`レコードを作成
    - `id`は自動生成
    - `title`, `description` は目的作成ページから送られてきたオブジェクトから取得し設定
    - `questions`, `deadline`はAI生成された内容を設定
    - `shareToken`は乱数を用いてランダムな値を生成
    - `createdAt`は初回のみ現在時刻を保存
    - `updatedAt`は初回のみ現在時刻を保存し、それ以降編集があれば編集された時刻を保存

### 4.回答ページ（共有URL）

- タイトル
  - `Purpose`レコードの`title`を表示
- アンケート回答者名
  - `respondentName`に保存する用のニックネーム、未入力でも可
- AI生成の質問
  - `Purpose`レコードの`questions`を表示
- 送信ボタン
  - クリック後に集計・AI解析ページに遷移
  - 入力した内容を基に`Response`レコードを作成
    - `id`は自動生成
    - `purposeId`は全ページから送られてきたものを使用
    - `clientId`はlocalStorageに保存されている本ページURLに紐づく`clientId`を使用
    - `respondentName`, `answers`はアンケート回答者名、AI生成の質問を使用
    - `createdAt`は初回のみ現在時刻を保存
    - `updatedAt`は初回のみ現在時刻を保存
- 画面読み込み時
  - uuidにより一意なIDを生成（`clientId`想定）
  - localStorageにこのページのURLと上記で生成した`clientId`の組み合わせを保存するオブジェクトが存在するか確認し、なければ新しく生成する

### 5. 集計・AI解析ページ

- 質問ごとの集計
  - `QuestionType`ごとに集計方法は分ける
    - 詳細については一旦保留
- AI要約
- AI推奨アクション（店・場所・プラン案など）