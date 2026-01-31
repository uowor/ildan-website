// api/upload-image.js
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { fileName, content, password } = req.body || {};
    const GITHUB_TOKEN = process.env.GH_TOKEN;
    const ADMIN_PW = process.env.ADMIN_PW;

    if (!content) {
        return res.status(400).json({ error: 'Image content is undefined' });
    }

    if (password !== ADMIN_PW) return res.status(401).json({ error: 'Unauthorized' });

    const owner = "uowor";
    const repo = "ildan-website";
    const uploadPath = `assets/images/${fileName}`;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${uploadPath}`;

    try {
        const putRes = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Upload image: ${fileName}`,
                content: content // 클라이언트에서 받은 Base64
            })
        });

        if (putRes.ok) {
            const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${uploadPath}`;
            res.status(200).json({ success: true, url: rawUrl });
        } else {
            throw new Error('GitHub API Image Upload Error');
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}