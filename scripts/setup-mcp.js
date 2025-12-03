// scripts/setup-mcp.js
import "dotenv/config";
import { execSync } from "child_process";

const pat = process.env.GITHUB_MCP_PAT;

if (!pat) {
    console.error("❌ ERROR: GITHUB_MCP_PAT is not set in .env");
    process.exit(1);
}

// Claude Code に MCP を登録（PATをヘッダとして渡す）
const cmd = `
claude mcp add --transport http github https://api.githubcopilot.com/mcp \
    -H "Authorization: Bearer ${pat}"
`;

console.log("▶ Running MCP registration:");
console.log(cmd);

try {
    execSync(cmd, { stdio: "inherit" });
    console.log("🎉 GitHub MCP registered successfully!");
} catch (err) {
    console.error("❌ Failed to register GitHub MCP");
    process.exit(1);
}
