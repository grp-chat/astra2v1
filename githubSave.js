require("dotenv").config();
const axios = require("axios");

async function saveToGitHub(dataObject) {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const path = process.env.GITHUB_PATH;
    const branch = process.env.GITHUB_BRANCH;
    const token = process.env.GITHUB_TOKEN;

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    try {
        // 1. Get current file SHA
        const getRes = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const sha = getRes.data.sha;

        // 2. Convert data to base64
        const content = Buffer.from(
            JSON.stringify(dataObject, null, 2)
        ).toString("base64");

        // 3. Save to GitHub
        const res = await axios.put(
            url,
            {
                message: "Update game state",
                content: content,
                sha: sha,
                branch: branch
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log("✅ Saved to GitHub:", res.data.commit.sha);

    } catch (err) {
        console.error("❌ Save failed:", err.response?.data || err);
    }

    console.log("✅ Saved to GitHub");

    return { message: "Saved successfully" };
}

module.exports = { saveToGitHub };