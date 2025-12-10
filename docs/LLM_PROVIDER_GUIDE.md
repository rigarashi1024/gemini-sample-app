# LLMプロバイダー切り替えガイド

このアプリケーションは、複数のLLMプロバイダーをサポートしており、環境変数を変更するだけで簡単に切り替えることができます。

## サポートしているプロバイダー

- **Google Gemini** (`gemini`) - デフォルト
- **Anthropic Claude** (`anthropic`)

## プロバイダーの切り替え方法

### 1. 環境変数の設定

`.env`ファイルで`LLM_PROVIDER`を設定します：

```env
# Geminiを使用する場合（デフォルト）
LLM_PROVIDER="gemini"
GEMINI_API_KEY="your_gemini_api_key"

# または

# Anthropic Claudeを使用する場合
LLM_PROVIDER="anthropic"
ANTHROPIC_API_KEY="your_anthropic_api_key"
```

### 2. APIキーの取得

#### Google Gemini
1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. APIキーを作成
3. `.env`ファイルの`GEMINI_API_KEY`に設定

#### Anthropic Claude
1. [Anthropic Console](https://console.anthropic.com/)にアクセス
2. APIキーを作成
3. `.env`ファイルの`ANTHROPIC_API_KEY`に設定

### 3. アプリケーションの再起動

環境変数を変更したら、開発サーバーを再起動します：

```bash
npm run dev
```

## アーキテクチャ

### LLMプロバイダー抽象化層

```
src/lib/llm/
├── types.ts                 # 共通インターフェース定義
├── gemini-provider.ts       # Gemini実装
├── anthropic-provider.ts    # Anthropic実装
├── provider-factory.ts      # プロバイダーファクトリー
└── index.ts                 # エクスポート
```

### 共通インターフェース

すべてのプロバイダーは`LLMProvider`インターフェースを実装します：

```typescript
interface LLMProvider {
  generateText(prompt: string, options?: LLMGenerateOptions): Promise<LLMResponse>;
  getProviderName(): string;
}
```

### 使用例

アプリケーション内でのLLM使用は、`src/lib/ai.ts`で抽象化されています：

```typescript
import { createLLMProvider } from './llm';

// 環境変数に基づいて適切なプロバイダーを自動選択
const llm = createLLMProvider();

// テキスト生成
const response = await llm.generateText(prompt, {
  temperature: 0.7,
  maxTokens: 4096,
});
```

## デフォルトモデル

### Gemini
- モデル: `gemini-2.0-flash-exp`
- 用途: アンケート生成、要約、推奨アクション生成

### Anthropic
- モデル: `claude-3-5-sonnet-20241022`
- 用途: 同上

## プロバイダーごとの特徴

### Google Gemini
- **長所**:
  - 高速なレスポンス
  - コストパフォーマンスが良い
  - 日本語に強い
- **短所**:
  - レート制限が厳しい場合がある

### Anthropic Claude
- **長所**:
  - 高品質な出力
  - 複雑なタスクに強い
  - 安定性が高い
- **短所**:
  - コストが高め
  - レスポンスがやや遅い

## トラブルシューティング

### APIキーエラー
```
Error: GEMINI_API_KEY is not set in environment variables
```
→ `.env`ファイルに正しいAPIキーが設定されているか確認

### プロバイダー切り替えが反映されない
→ 開発サーバーを再起動してください

### レート制限エラー
→ APIキーのクォータを確認し、必要に応じてプロバイダーを切り替えてください

## 新しいプロバイダーの追加方法

1. `src/lib/llm/`に新しいプロバイダークラスを作成
2. `LLMProvider`インターフェースを実装
3. `provider-factory.ts`にプロバイダー追加
4. `types.ts`の`LLMProviderType`に追加

例：
```typescript
// src/lib/llm/openai-provider.ts
export class OpenAIProvider implements LLMProvider {
  async generateText(prompt: string, options?: LLMGenerateOptions): Promise<LLMResponse> {
    // OpenAI実装
  }

  getProviderName(): string {
    return 'openai';
  }
}
```

## 本番環境での設定

Vercelなどのホスティングサービスでは、環境変数を以下のように設定します：

1. プロジェクト設定 → Environment Variables
2. `LLM_PROVIDER` を `gemini` または `anthropic` に設定
3. 対応する`GEMINI_API_KEY`または`ANTHROPIC_API_KEY`を設定
4. 再デプロイ

## まとめ

このアーキテクチャにより：
- ✅ プロバイダー切り替えが環境変数のみで可能
- ✅ 新しいプロバイダーの追加が容易
- ✅ アプリケーションコードの変更不要
- ✅ 各プロバイダーの特性を活かせる
