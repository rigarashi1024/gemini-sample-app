# 🔥 AI_RULES_CLAUDE.md
※ Claude開発アシスタント用ルール定義

---

## 🎯 AI利用ポジション

| 役割 | AI |
|---|---|
| 実装・コード生成 | Claude（メイン） |
| コードレビュー・改善提案 | Gemini 3 Pro（サブ） |
| 要約・アンケート・ドキュメント生成 | Claude（必要に応じGemini） |

Claude = 開発担当  
Gemini = レビュー担当

---

## 📌 技術スタック

- Next.js 14（App Router）
- TailwindCSS
- shadcn/ui
- Supabase（PostgreSQL）
- Prisma ORM
- Next.js Route Handlers（API）
- Vercel（デプロイ想定）

---

## 🧭 コーディング規約（Claudeが従うルール）

### 1. Next.js App Router

- /app をルート構成の中心とする
- APIは `app/api/**/route.ts`
- Server Componentがデフォルト（`use client` 明示時のみClient）  
- Server ActionsはDB・外部API処理を伴う場合のみ使用
- UIロジックはcomponentに切り出し、route内肥大化禁止

---

### 2. UI / shadcn / Tailwind

- UIは **shadcn/uiを優先活用**
- Tailwindはユーティリティベース。冗長なクラス重複禁止
- PresentationalとContainerコンポーネントは責務分離
- Props型は `type Props = { ... }` で明示、`any`禁止

---

### 3. Supabase + Prisma

- DBスキーマは `schema.prisma` で一元管理
- Prisma Client優先（Raw Query禁止）
- Supabase Auth使用。Sessionは基本Server側で扱う
- Prismaモデル型を流用しDTOの二重定義を避ける

---

### 4. APIとエラーハンドリング

- 例外はAPI層で必ず捕捉し `NextResponse.json({ error }, { status })`
- HTTPステータス: `200/400/401/404/500`を基本とする
- 個人情報をログ・レスポンスに含めない

---

### 5. テスト方針

- コアロジックにはユニットテスト推奨
- DBが必要な場合は supabase local or Prisma mock
- 必要に応じE2E（Playwright/Cypress）対応可能

---

## 🔥 Claudeの返答フォーマット

開発依頼に対する出力は次の形式にまとめること：

1. 要件整理（Claudeの理解）
2. 変更方針
3. 変更ファイル一覧
4. 実装コード
5. 確認・テスト方法
6. PRタイトル & 本文
7. GitHub MCPによるPR作成パラメータ（必要時）

---

## ❗ 禁止事項

- mainブランチへの直接push/merge禁止
- PRは1タスク1本（乱発禁止）
- raw SQL禁止（Prismaのみ使用）
- 個人情報の露出禁止（ログ/PR/Issue）

---

## セッション開始時の指示テンプレ

Claudeには毎回以下から開始する：
