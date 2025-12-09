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

Your role:
- Review ONLY the unified git diff provided.
- You must ONLY report issues that are *critical* and would likely break functionality or introduce security risks.

Allowed issue types:
- bug     (runtime errors, null crashes, broken behavior)
- security (vulnerabilities, unsafe data handling)
- logic   (incorrect conditions, mismatched specifications)

Do NOT report:
- style issues
- formatting or spacing
- naming conventions
- performance micro-optimizations
- minor suggestions or optional improvements
- markdown or documentation issues
- opinion-based preferences

Return output *strictly* in this format (no extra text, no questions, no greetings):

Issue-1:
    type: bug | security | logic
    file: (path or unknown)
    lines: (line or range)
    problem: (short explanation)
    reason: (why it's a problem)
    suggestion: (fix proposal)

Issue-2:
    ...

If there are no critical issues, return exactly:
"No major issues. LGTM."

===== DIFF START =====
${diff}
===== DIFF END =====
`;

// 簡易 sleep
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 429 / 503 のときにリトライするラッパー
async function generateReviewWithRetry(maxAttempts = 3, baseDelayMs = 20000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Calling Gemini... (attempt ${attempt}/${maxAttempts})`);
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      const isFetchError = err instanceof GoogleGenerativeAIFetchError;
      const isTransient =
        isFetchError && (err.status === 429 || err.status === 503);

      if (!isTransient) {
        // 認証エラーなどの致命的エラーはそのまま投げる
        console.error("Gemini API error (non-retryable):", err);
        throw err;
      }

      if (attempt === maxAttempts) {
        console.error(
          `Gemini temporary error (${err.status}) after ${maxAttempts} attempts. Giving up for this run.`
        );
        return null; // 今回はレビュー諦める（CIは成功扱いにする）
      }

      const delay = baseDelayMs * attempt; // 20s, 40s, 60s... みたいに増やす
      console.error(
        `Gemini temporary error (${err.status}). Retrying in ${Math.round(
          delay / 1000
        )} seconds...`
      );
      await sleep(delay);
    }
  }

  return null;
}

(async () => {
  let reviewText;

  try {
    reviewText = await generateReviewWithRetry();
  } catch (err) {
    // リトライ不能なエラー
    console.error("Unexpected error calling Gemini:", err);
    process.exit(1);
  }

  if (!reviewText) {
    // 429/503 が続いたなど、一時的エラーで諦めたケース
    console.log("Gemini review skipped due to temporary errors.");
    process.exit(0); // CI としては成功扱い
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
