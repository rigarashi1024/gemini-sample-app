import fs from "fs";
import axios from "axios";
import { GoogleGenerativeAI, GoogleGenerativeAIFetchError } from "@google/generative-ai";

const diff = fs.readFileSync("pr.diff", "utf8");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    process.exit(0); // ここは失敗じゃなく成功終了にしておく手も
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

const prompt = `...さっきの diff 用プロンプト...`;

async function main() {
    console.log("Calling Gemini...");

    let reviewText;
    try {
        const result = await model.generateContent(prompt);
        reviewText = result.response.text();
    } catch (err) {
        // クォータエラーだけ握りつぶす
        if (err instanceof GoogleGenerativeAIFetchError && err.status === 429) {
            console.error("Gemini quota exceeded. Skipping AI review for this run.");
            // ここで PR コメントに「クォータ超過でレビュースキップしました」と書いても良いし、
            // 何もせず終了でもOK
            process.exit(0); // CI としては成功扱いにする
        }
        // その他は普通にエラーとして落とす
        console.error(err);
        process.exit(1);
    }

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
}

main();
