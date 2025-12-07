import fs from "fs";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai"; // ★修正

// --- Read diff ---
const diff = fs.readFileSync("pr.diff", "utf8");

// --- Gemini client ---
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // ← モデル名はお好みで

// --- Prompt for Gemini ---
const prompt = `
You are a code reviewer. Review the following Pull Request diff.

Return output *strictly* in this format:

Issue-1:
    type: bug | performance | style | security | logic | other
    file: (path or unknown)
    lines: (line or range)
    problem: (short explanation)
    reason: (why it's a problem)
    suggestion: (fix proposal)

Issue-2:
    ...

If no issues, write:
"No major issues. LGTM."

===== DIFF START =====
${diff}
===== DIFF END =====
`;

// --- Call Gemini ---
console.log("Calling Gemini...");
const result = await model.generateContent(prompt);
const reviewText = result.response.text();

// --- Post review comment to GitHub ---
console.log("Posting review to GitHub...");
await axios.post(
    `https://api.github.com/repos/${process.env.REPO_FULL_NAME}/issues/${process.env.PR_NUMBER}/comments`,
    { body: `### 🤖 Gemini PR Review\n\n${reviewText}` },
    {
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            "Content-Type": "application/json",
        },
    }
);

console.log("Gemini review posted successfully!");
