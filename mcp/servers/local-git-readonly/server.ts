// mcp/servers/local-git-readonly/server.ts（イメージ）

import { spawn } from "child_process";
// MCPプロトコルに沿ったサーバー初期化処理...
// server.registerTool("git_status", ...)
// server.registerTool("git_diff", ...)

function runGitCommand(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("git", args, { cwd: process.cwd() });
    let out = "";
    let err = "";
    proc.stdout.on("data", (d) => (out += d.toString()));
    proc.stderr.on("data", (d) => (err += d.toString()));
    proc.on("close", (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(err || `git exited with code ${code}`));
    });
  });
}

// 例: tool "git_status"
async function gitStatusTool() {
  return await runGitCommand(["status", "--short"]);
}
