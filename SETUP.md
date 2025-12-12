# PurposeSurvey セットアップガイド

## プロジェクト概要

PurposeSurveyは、目的を入力するだけでAIが自動でアンケートを生成し、回答収集・集計・AI分析を行うWebアプリケーションです。

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router)
- **スタイリング**: TailwindCSS + shadcn/ui
- **バックエンド**: Next.js Route Handlers
- **データベース**: PostgreSQL (Supabase推奨)
- **ORM**: Prisma
- **AI**: Google Gemini API（プロバイダー切り替え可能）

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
# データベース接続URL (Supabaseまたはローカル PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/purpose_survey?schema=public"

# LLM Provider (gemini または anthropic)
LLM_PROVIDER="gemini"

# Google Gemini API Key
GEMINI_API_KEY="your_gemini_api_key"

# Anthropic API Key (LLM_PROVIDER=anthropicの場合に使用)
ANTHROPIC_API_KEY="your_anthropic_api_key"

# GitHub MCP Token (開発用)
GITHUB_MCP_PAT="your_github_token"
```

### 3. Prismaのセットアップ

```bash
# Prisma Clientの生成
npx prisma generate

# データベースマイグレーション
npx prisma migrate dev --name init

# (オプション) Prisma Studioでデータベースを確認
npx prisma studio
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いてアプリケーションにアクセスできます。

## プロジェクト構造

```
gemini-sample-app/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # APIルートハンドラ
│   │   │   ├── purposes/         # Purpose関連API
│   │   │   ├── responses/        # Response関連API
│   │   │   ├── share/            # 共有URL用API
│   │   │   └── analysis/         # 集計・分析API
│   │   ├── create/               # 目的作成ページ
│   │   ├── edit/                 # アンケート編集ページ
│   │   ├── share/[token]/        # 回答ページ
│   │   ├── analysis/[id]/        # 集計・AI解析ページ
│   │   ├── layout.tsx            # ルートレイアウト
│   │   ├── page.tsx              # トップページ
│   │   └── globals.css           # グローバルCSS
│   ├── components/
│   │   └── ui/                   # shadcn/uiコンポーネント
│   ├── lib/
│   │   ├── prisma.ts             # Prisma Client
│   │   ├── ai.ts                 # AI連携機能
│   │   └── utils.ts              # ユーティリティ
│   └── types/
│       └── survey.ts             # 型定義
├── prisma/
│   └── schema.prisma             # Prismaスキーマ
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 主要機能

### 1. アンケート作成フロー
1. トップページで「アンケートを作成」をクリック
2. 目的とタイトルを入力
3. AIが自動で質問を生成
4. 質問を確認・編集して保存

### 2. 回答収集
1. トップページで共有URLをコピー
2. 回答者はURLにアクセスして回答
3. 回答は自動的にデータベースに保存

### 3. 集計・AI分析
1. トップページで「集計を確認」をクリック
2. 質問ごとの集計結果を表示
3. AIが回答を分析して要約と推奨アクションを生成

## データモデル

### Purpose（アンケート）
- タイトル、説明、質問（JSON）、共有トークン、締切

### Response（回答）
- Purpose ID、クライアントID、回答者名、回答内容（JSON）

## トラブルシューティング

### データベース接続エラー
- `DATABASE_URL`が正しく設定されているか確認
- PostgreSQLサーバーが起動しているか確認

### AI機能が動作しない
- `LLM_PROVIDER`が`gemini`または`anthropic`に設定されているか確認
- Gemini使用時: `GEMINI_API_KEY`が正しく設定されているか確認
- Anthropic使用時: `ANTHROPIC_API_KEY`が正しく設定されているか確認
- APIキーに十分なクレジットがあるか確認

### マイグレーションエラー
```bash
# マイグレーションをリセット
npx prisma migrate reset

# 再度マイグレーション実行
npx prisma migrate dev
```

## デプロイ

### Vercelへのデプロイ

1. GitHubリポジトリにプッシュ
2. Vercelでプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

### 環境変数の設定（本番環境）
- `DATABASE_URL`: Supabaseの接続URL
- `LLM_PROVIDER`: 使用するLLMプロバイダー（`gemini`または`anthropic`）
- `GEMINI_API_KEY`: Google Gemini APIキー
- `ANTHROPIC_API_KEY`: Anthropic APIキー（任意）

## ライセンス

MIT
