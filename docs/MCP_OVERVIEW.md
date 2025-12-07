# MCP_OVERVIEW.md

このプロジェクトで利用する MCP サーバーの一覧と役割をまとめる。

## 一覧

- github
  - 種類: remote (GitHub公式)
  - URL: https://github-mcp.example.com
  - 用途: Pull Request 作成・取得
  - 禁止: リポジトリ設定変更、ブランチ削除、マージ操作

- local-git-readonly
  - 種類: local
  - コマンド: node mcp/servers/local-git-readonly/server.js
  - 用途: `git status`, `git diff` の結果取得（読み取り専用）
  - 禁止: `git push`, `git merge`, `git reset` などの履歴変更系

## ポリシー

- 本番・本番候補環境では、上記に記載された MCP 以外は使用しない。
- 新しい MCP を導入する場合は:
  1. `mcp/servers/` 配下にソースを追加
  2. `mcp/mcp.config.json` にエントリを追加
  3. このファイルに用途・禁止事項を明記
