# README.md

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

     ### アンケート自動生成に関する制約（集計可能性を保証するためのルール）

     AI がアンケート（Questions JSON）を生成する際は、以下の制約を厳密に守ること。
     1. 集計可能な形式を必須とする  
        - 基本的に free_text 型の質問は避け、可能な限り選択肢形式（single_choice / multi_choice / range / number / scale）で生成すること。  
        - 数値や予算に関する質問では、AI が明確な範囲（例：1000–1500円、1500–2000円）を複数提示し、その中から選べる形式にすること。  
        - 「その他」を許可する場合は options の最後に "その他" を含め、free_text と組み合わせて扱えるようにする。
     2. 選択肢は互いに排他的かつ重複しないように設計する  
        - 例：「1000円〜2000円」「2000円〜3000円」など境界が重複しないようにする。  
        - あいまいな文言（「安め」「高め」など）は禁止し、必ず定量的な表現にすること。
     3. 選択肢の粒度は目的に応じて適切にそろえる  
        - 例：予算に関する選択肢は 3〜6 個程度に絞る（数が多すぎると集計が困難になるため）。
     4. Yes/No の二択問題は明確に Yes / No として生成する  
        - 「たぶん」「どちらともいえない」など曖昧な選択肢を追加する場合は、意味が明確になるように名称を統一する。
     5. AI は必ず Questions JSON の仕様に完全準拠した出力を行う  
        - 型のブレ（例：数値を文字列で返す / id 欠落）を禁止する。  
        - id はすべてユニークな文字列を生成すること。
     6. 集計が困難になる質問形式は禁止する  
        - あいまいな自由記述を前提とした質問  
        - 選択肢の意味が曖昧・重複している質問  
        - 設問意図が不明確な質問（例：「どう思いますか？」など）
     7. free_text が必要な質問を作成する場合  
        - その質問は「集計対象外」として扱う前提で作成し、free_text 問題を多用しないこと。
     8. 質問生成時、ユーザー入力に明示的な地名が含まれない限り、AI は特定の地域名（例：渋谷、新宿、梅田など）を質問文に挿入してはならない。
     9. 「場所」「エリア」に関する項目を作成する場合は、原則として text（自由入力）または大分類の選択肢 + 自由入力を使用し、具体的な地名を固定した選択肢を生成しないこと。

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
  - 開発支援AI（コード生成・実装）: **Claude**（メイン）
  - コードレビュー / 比較・フィードバック: **Gemini 2.0 Flash**（サブ）
  - アプリ内機能としてのアンケート生成・要約: **Gemini 2.0 Flash**（LLMプロバイダー切り替え可能な設計）
- デプロイ: Vercel（任意）

---

## 5. データモデル（汎用化版）

- 以下テーブルとテーブル内で使用するJSONを並列に表現する。

### テーブル定義

#### Purpose（アンケートを作成するベースとなる目的）

Purpose 作成前に `PurposeSurvey.clientId` を必ず用意する

- `id: string` - 一意となるID
- `title: string` — ユーザーが入力したタイトル
- `description: string` — ユーザーが入力した目的
- `questions: Json` - descriptionをベースに作成された質問。**`Questions` 型の JSON を保存する**（下記JSON定義を参照）
- `shareToken: string` - URL用のランダムトークン
- `deadline: Datetime | null` - アンケートの締切日
- `createdBy: string` - `localStorage` に保存されている `clientId` を使用する
- `createdAt: Datetime` - レコードの作成日
- `updatedAt: Datetime` - レコードの更新日（初回はcreatedAtと同じDatetimeを保存）

#### Response（アンケートの回答）

- `id: string` - 一意となるID
- `purposeId: string` - 本レコードと紐づく `Purpose` テーブルレコードのID
- `clientId: string | null` - **ブラウザ（クライアント）を識別するID。ブラウザごとに1つのみ生成し、全アンケートで共通利用する。**
- `respondentName: string | null`
- `answers: Json` - 質問への回答一覧、フォーマットについては後述するJSON定義に詳細記述
- `createdAt: Datetime` - レコードの作成日
- `updatedAt: Datetime` - レコードの更新日（初回はcreatedAtと同じDatetimeを保存）

---

## 5-1. JSON定義

### Question

```ts
type Question = {
  id: string;          // 一意となるID 
  label: string;       // 質問内容
  type: QuestionType;  // 質問形式（後述）
  options?: string[];  // 選択肢。single_choice / multi_choice など choice系でのみ使用。テキストラベルとして扱う。
  required: boolean;   // 必須の質問か
}
```

---

## 5-2. LocalStorage保存情報

```ts
type PurposeSurvey = {
    clientId: string;
    purposes?: {
        id: string,
        hasAnswer: boolean
    }[]
}
```

---

## 6. 画面構成（汎用）

### 1. トップページ

- 「目的を入力してアンケートを自動生成」ボタン
  - クリック後に目的作成ページに遷移
- 生成済みアンケート（Purpose）のタイトル一覧
  - `localStorage.getItem("PurposeSurvey")` を確認
    - `PurposeSurvey`の`clientId`が存在している場合のみ、`Purpose.createdBy = PurposeSurvey.clientId` のレコードのみ取得して表示する
  - 期限（deadline）を過ぎていない Purpose のみリスト表示する
  - 各タイトルにはアンケート確認・編集ページへのリンクが含まれる
  - 各タイトルの横に「共有用URLをコピー」ボタンを配置
    - ページ生成時に Purpose.shareToken をベースに共有用URLを生成しておく
    - クリック時、そのURLをクリップボードにコピーする
- 回答済みアンケートの一覧
  - `localStorage.getItem("PurposeSurvey")` を確認
    - `PurposeSurvey`の`clientId`が存在している場合のみ、`Response.clientId = PurposeSurvey.clientId` のレコードから JOIN して `Purpose` 情報を取得して表示する
  - アンケートタイトルを表示
  - 各タイトルの横に「自分の回答を編集」ボタンを配置
    - クリック時に回答ページ（共有URL）に遷移

- 「集計内容を確認」ボタン
- 各Purpose 行ごとに配置されている前提とし、クリック後にその Purpose の集計・AI解析ページに遷移する

### 2. 目的作成ページ

- タイトル入力欄
- 説明（目的）の自由入力欄
- 「AIでアンケート生成」ボタン
  - クリック時にアンケート確認・編集ページに遷移
  - この時点では Purpose レコードはまだ作成しない
  - 入力したタイトル・説明をオブジェクトとして次ページに渡す

### 3. アンケート確認・編集ページ

- タイトル
- ユーザーが目的作成ページで入力したタイトルを表示（保存時に `Purpose.title` として使う）
- AI生成したアンケート内容（Questions）
  - AIが description をもとに生成した質問一覧を表示
  - 必要であればユーザーが質問文・必須フラグ・選択肢などを編集できる
  - 期限（deadline）に関する質問がAI生成されていない場合、
    - 締切を指定できる任意の項目として追加してもよい（実装時に判断）
- 「アンケート再生成」ボタン
  - クリックすると、同じタイトル・説明から再度 AI に質問生成を依頼し、一覧を置き換える
- 「保存」ボタン
  - クリック後、トップページに遷移
  - 保存処理の前に、`localStorage.getItem("PurposeSurvey")` を確認する
    - 存在しない場合は、新しい `clientId`（uuid など）を生成し、`PurposeSurvey` オブジェクト（clientId, purposes: []）を作成して保存する
  - 入力した内容を基に Purpose レコードを作成する：
    - id: 自動生成
    - title, description: 目的作成ページから引き継いだもの
    - questions: 編集済みの `Questions` JSON を保存
    - deadline: 必要に応じて、質問内容とは別に `Purpose` 自体の締切を設定（未設定でも可）
    - shareToken: 乱数で生成したランダムな文字列
    - createdBy: `localStorage` に保存されている `PurposeSurvey.clientId` を使用する
    - createdAt: 現在時刻
    - updatedAt: 現在時刻（以後編集があれば更新）

### 4. 回答ページ（共有URL）

- タイトル
  - `Purpose.title` を表示
- アンケート回答者名入力欄
  - `respondentName` に保存されるニックネーム。未入力でも可
- AI生成の質問
  - `Purpose.questions`（Questions JSON）をもとにフォームを動的にレンダリングする
- 送信ボタン
  - クリック後に 集計・AI解析ページに遷移する（今回は回答者も集計画面を見てよい）
  - (purposeId, clientId) の組み合わせで既存の `Response` レコードが存在する場合は「更新」、存在しない場合は「新規作成」として扱う（実装上は UPSERT などを利用してよい）
  - 入力した内容を基に `Response` レコードを作成または更新する：
    - id: 自動生成（更新時は既存の id を維持）
    - purposeId: 対象の `Purpose` のID
    - clientId: `localStorage` に保存されている `PurposeSurvey.clientId` を使用
    - respondentName: 入力されたニックネーム（未入力なら null）
    - answers: フォームから得た回答内容（`Answers` 型）
    - createdAt: 新規作成時は現在時刻、更新時は既存レコードの値を維持
    - updatedAt: 現在時刻
  - 集計画面では、回答者名など個人を特定し得る情報はマスキングする（例：ニックネームを一覧に出さない / サマリだけ表示する 等）
  - 送信完了後、localStorage 内の PurposeSurvey を更新する：
    - PurposeSurvey.purposes から `id == purposeId` の要素を探す
    - 見つかった場合は、その要素の `hasAnswer` を `true` に更新する
    - 見つからない場合は `{ id: purposeId, hasAnswer: true }` を PurposeSurvey.purposes に追加する
    - 更新後の PurposeSurvey を JSON 文字列として localStorage に保存する

- 画面読み込み時の clientId 処理
  - ブラウザごとに1つの clientId を持つ想定とする
  - ページ読み込み時に以下を行う：
    1. localStorage.getItem("PurposeSurvey") を確認する
    2. もし存在しない場合：
       - 新しい clientId（uuid など）を生成する
       - PurposeSurvey オブジェクトを次の形式で作成し、localStorage に保存する：
         {
           clientId: <生成した clientId>,
           purposes: [
             {
               id: <現在表示中の purposeId>,
               hasAnswer: false
             }
           ]
         }
    3. すでに PurposeSurvey が存在する場合：
       - JSON.parse して PurposeSurvey オブジェクトを取得する
       - PurposeSurvey.purposes の中から `id === purposeId` の要素を探す
         - 見つからない場合：
           - `{ id: purposeId, hasAnswer: false }` を PurposeSurvey.purposes に追加する
         - 見つかった場合：
           - その要素の `hasAnswer` が true であれば、
             「このブラウザはすでにこのアンケートへ回答済み」とみなし、
             UI 側でそれに応じた表示（再回答ブロック・注意メッセージなど）を行う
       - 更新された PurposeSurvey オブジェクトを JSON 文字列として localStorage に保存する
    4. clientId はこのブラウザからの全アンケート回答で共通に利用する
  - Response テーブルでは (purposeId, clientId) の組をユニークに扱うことで、同じブラウザから同じアンケートへの重複回答を抑制する（実装側でユニーク制約を入れてもよい）

### 5. 集計・AI解析ページ

- 対象 Purpose の情報（タイトル、説明、締切など）を表示
- 質問ごとの集計
- QuestionType ごとに集計方法を変える（詳細ロジックは実装時に詰める）：
  - single_choice / multi_choice / tags: 選択肢ごとのカウント・割合
  - scale / number / rating: 平均値・最小値・最大値など
  - date: 選択された日付の分布
  - range: 分布の概要（例：最小/最大/中央値など）
  - text: 自由記述一覧やサマリのみでもよい
  - 締切（deadline）を過ぎた後に送信された回答について：
    - 回答自体は受け付ける。
    - 集計に含めるかどうかをオプションで切り替えられると望ましい（例：「締切以降の回答を含める/含めない」のチェックボックス）
- AI要約
  - 集計結果と回答一覧をもとに、AIが目的達成に必要な条件・傾向を5〜10行程度で要約する
- AI推奨アクション（店・場所・プラン案など）
  - 回答内容に基づき、
    - どのような店タイプが適しているか
    - どのような旅行プランになりそうか
    - どのような準備物が必要か
  - など、テキストベースで推奨案を返す（外部APIによる実店舗検索等は行わない）
- 「トップに戻る」ボタン
  - トップページに遷移
- 「自分の回答を編集」ボタン
  - 回答済みの場合のみヘッダー部分に表示
  - クリック時に回答ページ（共有URL）に遷移

### 7. AIエージェントへのメモ

- 上記仕様に従い、必要に応じて質問・確認を行った上で実装を進めること。
- JSON スキーマ（Questions / Answers / AnswerValue）の形式は厳密に守ること。
- clientId は「ブラウザ単位の匿名ID」であり、個人を直接特定するためのものではない。
- 回答送信後、回答者が集計画面を見てもよいが、個人が特定されないような表示に配慮すること。
