# PurposeSurvey（Next.js Route Handlers + Prisma）バックエンド単体テスト：確認すべき事項まとめ

> 目的 → 質問生成 → 回答収集 → 集計 → 推奨 の一連を支えるバックエンド（Route Handlers / Service 層）の単体テスト観点。:contentReference[oaicite:0]{index=0}

---

## 0. 前提（単体テストで“どこまで”見るか）
- **基本方針**: 「Route Handler（薄い）→ Service（厚い）→ DB/LLM/外部」を想定し、単体テストでは **Service の分岐・制約・整合性** を中心に検証する  
- **外部依存の扱い**:
  - DB（Prisma）は **Repository をモック** or **Prisma Client をスタブ**（ユニーク制約/Upsert などは重要なので必要なら“DB付きの単体寄りテスト”も検討）
  - LLM（Gemini 等）は **完全モック**（入力に対して想定の JSON/失敗を返す）
  - POCでは外部API連携はしない（例: Google Maps検索などは行わない）:contentReference[oaicite:1]{index=1}

---

## 1. 入出力のバリデーション（Route Handler / Service 共通）
- **必須パラメータ**
  - Purpose作成に必要な title/description/questions 等が欠けている時に適切に弾く:contentReference[oaicite:2]{index=2}
  - Response送信で purposeId が欠けている / 不正な形式
- **型・JSON形式**
  - `Purpose.questions` は `Questions` 型の JSON として保存される前提なので、構造が壊れていないか（id/label/type/required 等）:contentReference[oaicite:3]{index=3}
- **境界値**
  - 空文字、極端に長い文字列、想定外の QuestionType、options が必要なのに無い等

---

## 2. 質問生成（LLM出力の検証・制約）
README上、質問生成は「集計可能性」を保証するための制約が重要なので **ここが単体テストの核**。:contentReference[oaicite:4]{index=4}

### 2-1. LLM出力が制約に違反した場合の扱い
- free_text を避ける/抑制できているか（必要時は“集計対象外”扱いに落とす）:contentReference[oaicite:5]{index=5}
- 選択肢が **排他的** / **重複しない**（境界の重複・曖昧語がない）:contentReference[oaicite:6]{index=6}
- 「その他」「特に希望なし」などの逃げが必ずある:contentReference[oaicite:7]{index=7}
- Questions JSON 仕様に完全準拠（id欠落、数値の型ブレ等を許さない）:contentReference[oaicite:8]{index=8}
- 地名の自動挿入禁止（ユーザー入力に明示が無ければ地域名を入れない）:contentReference[oaicite:9]{index=9}

### 2-2. 期待する“補正/リトライ/エラー”の方針テスト
- 不正JSONを受け取った場合に
  - ① リトライ（同一プロンプト再実行）するのか
  - ② サーバ側で補正するのか
  - ③ エラーとして返すのか  
  → **実装方針に沿って**分岐をテスト（※READMEは「厳密に守る」前提）:contentReference[oaicite:10]{index=10}

---

## 3. Purpose 作成（保存処理の整合性）
- **createdBy / clientId の扱い**
  - Purpose 作成前に `PurposeSurvey.clientId` が必要（ブラウザ単位）:contentReference[oaicite:11]{index=11}
- **保存項目の整合**
  - `shareToken` はランダム生成され、共有URL用になる:contentReference[oaicite:12]{index=12}
  - `deadline` は null も許容（未設定可）:contentReference[oaicite:13]{index=13}
  - updatedAt 初回は createdAt と同じ（運用ルール通り）:contentReference[oaicite:14]{index=14}
- **期限フィルタの前提**
  - トップページ表示は「deadlineを過ぎていないPurposeのみ」前提なので、取得ロジックがある場合は期限境界をテスト:contentReference[oaicite:15]{index=15}

---

## 4. 回答（Response）作成/更新（Upsert・重複抑止）
- **Upsert要件**
  - (purposeId, clientId) で既存があれば更新、なければ新規（UPSERT想定）:contentReference[oaicite:16]{index=16}
- **重複抑止**
  - (purposeId, clientId) をユニーク扱いにして重複回答を抑制（ユニーク制約を入れてもよい）:contentReference[oaicite:17]{index=17}
- **更新時の不変条件（Invariants）**
  - 更新時でも `id` は維持、`createdAt` は維持、`updatedAt` のみ更新:contentReference[oaicite:18]{index=18}
- **answers JSON の整合**
  - answers が Questions の id と整合している（存在しない questionId への回答を弾く/無視する等）

---

## 5. 集計（Aggregation）ロजिक（QuestionType別）
- **集計方式がQuestionTypeで変わる**前提なので、型ごとの分岐を網羅:contentReference[oaicite:19]{index=19}
  - single_choice / multi_choice / tags: 件数・割合:contentReference[oaicite:20]{index=20}
  - scale / number / rating: 平均・最小・最大:contentReference[oaicite:21]{index=21}
  - date: 日付分布:contentReference[oaicite:22]{index=22}
  - range: 分布概要（例: 最小/最大/中央値）:contentReference[oaicite:23]{index=23}
  - text: 一覧 or サマリのみでも可:contentReference[oaicite:24]{index=24}

### 5-1. 締切後回答の扱い（重要な分岐）
- 締切を過ぎても回答自体は受け付ける:contentReference[oaicite:25]{index=25}
- 集計に含めるかはオプションで切替可能が望ましい（含める/含めない）:contentReference[oaicite:26]{index=26}  
→ **単体テスト**: `includeLateResponses=true/false` 相当の引数で集計結果が変わること

### 5-2. 個人情報のマスキング
- 集計画面では respondentName 等、個人を特定し得る情報はマスキング方針:contentReference[oaicite:27]{index=27}  
→ 単体テスト: 集計API/Serviceの返却DTOに respondentName を含めない（または条件付き）

---

## 6. AI要約 / 推奨（LLM呼び出し前後）
- 要約は「集計結果と回答一覧」を元に 5〜10行程度:contentReference[oaicite:28]{index=28}
- 推奨はテキストベースで返す（外部API検索しない）:contentReference[oaicite:29]{index=29}
- 単体テスト観点
  - LLMに渡す入力（集計結果の形・回答一覧の形）が壊れていない
  - LLM失敗時（timeout/invalid JSONなど）のフォールバック（エラー返却 or “要約なし”で返す等）
  - “外部APIを呼ばない”保証（実装が誤って外部検索処理を踏まない）:contentReference[oaicite:30]{index=30}

---

## 7. 条件分岐のテストはどこまでやるべき？
- **やるべき**（特にバックエンド）  
  - READMEの仕様には「締切後回答の含有切替」:contentReference[oaicite:31]{index=31} や「Upsert」:contentReference[oaicite:32]{index=32} のように、**分岐＝仕様**の箇所が多い  
- 目安（実用）
  - “if の数”ではなく、**仕様として意味がある分岐**（=結果が変わる・データが変わる・権限/公開範囲が変わる）を優先して網羅

---

## 8. コード内の分岐から逆算してテストケースを作れる？
- 可能（むしろおすすめ）
  - 集計Serviceなら「QuestionType別 switch」「deadline判定」「includeLateResponses」「空回答」「無効回答」などを抽出してケース化
  - Response保存なら「既存あり/なし（Upsert）」「ユニーク制約衝突」「createdAt維持/updatedAt更新」などを抽出:contentReference[oaicite:33]{index=33}

---

## 9. 不変条件（Invariants）としてよく見るポイント（このREADME文脈）
- 更新でも `id` と `createdAt` は変えない（`updatedAt` は更新）:contentReference[oaicite:34]{index=34}
- 重複抑止のキー (purposeId, clientId) の意味は変えない:contentReference[oaicite:35]{index=35}
- 質問スキーマの必須制約（idユニーク、型ブレ禁止等）は常に守る:contentReference[oaicite:36]{index=36}
