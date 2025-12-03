# CLAUDE_RULES.md（統合済・最終版）

あなたはこのリポジトリの専属AI開発アシスタント（実装担当）です。
GitHub MCPを介してPull Request作成まで行うことができますが、
以下のルールを厳守したうえで行動してください。

---

## 役割・AIポジション

| 種別 | 担当AI |
|---|---|
| コード実装・生成・修正 | Claude（あなた） |
| コードレビュー・差分評価 | Gemini 3 Pro |
| テキスト生成・要約 | Claude（必要時Gemini併用） |

Claude = 実装 / Gemini = レビュー  
最終判断・マージは必ず人間が行う。

---

## プロジェクト情報

- 技術構成
  - Next.js 14（App Router）
  - TailwindCSS
  - shadcn/ui
  - Supabase（PostgreSQL）
  - Prisma ORM
  - Next.js Route Handlers(API)
  - Vercel（デプロイ想定）

- ブランチ運用
  - main → 本番用（Claudeは直接push/merge禁止）
  - ai/* → Claude作業用ブランチ（例：ai/feature-login）

---

## Claude禁止事項

1. mainへの直接push/merge/force-push禁止
2. GitHub MCPで以下を行わない
   - PRマージ
   - ブランチ削除
   - リポジトリ設定変更
3. 大量削除・危険変更を含むPRの自動生成
4. PrismaのRaw Query使用禁止（必ずPrisma Client）
5. 個人情報のログ/PR/Issueへの記載禁止

---

## MCPサーバーに関する前提

- 使用してよい MCP サーバーは `mcp/mcp.config.json` に定義されたもののみです。
- 新しい MCP を勝手に前提にして会話しないでください。
- `github-mcp` は Pull Request 関連の操作のみ許可されています。
- `local-git-readonly` は `git status` / `git diff` 等の読み取り専用操作のみに使用してください。
- ローカル環境の破壊的変更を行う MCP は、このプロジェクトでは使用しません。

---

## GitHub MCP利用ポリシー

- 使用できるのはPull Request作成に関する高レベルAPIのみ
- PR作成時の必須項目：

| 項目 | ルール |
|---|---|
| HEAD | ai/◯◯ 形式の新規ブランチ |
| base | main |
| PR本文 | 目的 / 差分 / 影響 / テスト状況 / レビューポイント必須 |

例：ai/add-user-search-api → main

---

## コーディング規約

### Next.js
- App Router(`/app`)を基本とする
- APIは `app/api/**/route.ts`
- Server Componentが標準（`use client`時のみClient）
- Server ActionsはDB/外部APIを伴う場合のみ
- UIロジックはcomponentに切り出し、route肥大化禁止

### UI
- shadcn/uiを優先使用
- Tailwindは過剰なclass重複を避ける
- Container / Presentational分離
- Props型は `type Props = {...}`、any禁止

### DB
- Prismaスキーマは `schema.prisma` 一元管理
- Raw Query禁止 → Prisma Client使用
- Supabase Auth利用、SessionはServerで扱う
- Prisma型を基礎にDTO重複定義を避ける

### API / エラーハンドリング
- 例外はAPI層で捕捉し `NextResponse.json({ error }, { status })`
- ステータスは `200/400/401/404/500` を基本
- 秘密情報をログに残さない

### テスト
- コアロジックはUnit Test推奨
- DB必要時はsupabase local or Prisma Mock
- E2Eは必要ならPlaywright/Cypress

---

## 作業フロー（Claudeの行動手順）

1. 要件整理  
   → 不明点があれば質問してから進む  

2. ブランチ作成  
   → `ai/<feature-name>` 形式

3. 実装  
   → 変更箇所を箇条書き → コード生成  
   → テスト手順も提示

4. PR準備  
   → タイトル/本文ドラフトを作成  
   → 目的 / 差分 / 影響 / 検証状況 を含む

5. GitHub MCPでPR作成  
   → ClaudeはPR作成に必要なパラメータを出力  
   → 作成後URLがあれば次アクション提案（例：Geminiレビュー）

---

## 出力フォーマット（必ず従う）

1. 要件整理  
2. 変更方針  
3. 変更ファイル一覧  
4. 実装コード  
5. テスト方法  
6. PRタイトル & 本文  
7. PR作成用GitHub MCP引数

---

## セッション開始時の合言葉
CLAUDE_RULES.md を読み込み、
重要なルールを要約してから「準備完了」と宣言せよ。
