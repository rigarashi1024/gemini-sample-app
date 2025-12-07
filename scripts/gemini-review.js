import fs from "fs";
import axios from "axios";
import { GoogleGenerativeAI, GoogleGenerativeAIFetchError } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not set. Skipping Gemini review.");
  process.exit(0); // CIとしては成功扱いで終了
}

// --- Read diff file ---
const diffFilePath = "pr.diff";
let diff = "";

try {
  diff = fs.readFileSync(diffFilePath, "utf8");
} catch (err) {
  console.error(`Diff file "${diffFilePath}" not found. Skipping Gemini review.`);
  process.exit(0);
}

// 空diffは無視
if (!diff.trim()) {
  console.log("Diff is empty. Skipping Gemini review.");
  process.exit(0);
}

// --- Gemini client ---
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

// --- Prompt for Gemini ---
const prompt = `
You are a code reviewer bot running in GitHub Actions.

Task:
- You will be given a unified git diff.
- Review ONLY the changes in the diff.
- Find bugs, security issues, performance issues, style issues, and logic problems.

Return output *strictly* in this format (no extra text, no questions, no greetings):

Issue-1:
    type: bug | performance | style | security | logic | other
    file: (path or unknown)
    lines: (line or range)
    problem: (short explanation)
    reason: (why it's a problem)
    suggestion: (fix proposal)

Issue-2:
    ...

If there are no significant issues, return exactly:
"No major issues. LGTM."

===== DIFF START =====
${diff}
===== DIFF END =====
`;

(async () => {
  console.log("Calling Gemini...");

  let reviewText;
  try {
    const result = await model.generateContent(prompt);
    reviewText = result.response.text();
  } catch (err) {
    // Handle GoogleGenerativeAIFetchError specifically
    if (err instanceof GoogleGenerativeAIFetchError) {
      // Transient errors: retry later or skip
      if (err.status === 429 || err.status === 503) {
        console.error(
          `Gemini temporary error (${err.status}). Skipping AI review for this run.`
        );
        process.exit(0); // CI success - transient issue
      }

      // Other API errors (auth, invalid request, etc.)
      console.error(`Gemini API error (${err.status}):`, err.message);
      process.exit(1);
    }

    // Network or other unknown errors
    console.error("Unexpected error calling Gemini:", err);
    process.exit(1);
  }

  console.log("Posting review to GitHub...");

  try {
    await axios.post(
      `https://api.github.com/repos/${process.env.REPO_FULL_NAME}/issues/${process.env.PR_NUMBER}/comments`,
      { body: `### 🤖 Gemini PR Review\n\n${reviewText}` },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    console.log("Gemini review posted successfully!");
  } catch (err) {
    if (err.response) {
      console.error("GitHub API error:", err.response.status, err.response.data);
    } else {
      console.error("Network error posting to GitHub:", err.message);
      console.error("Full error:", err);
    }
    process.exit(1);
  }
})();
