// Vercel Serverless Function
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { title, content, password } = req.body;
    const GITHUB_TOKEN = process.env.GH_TOKEN; // Vercel Dashboard에서 설정한 변수
    const ADMIN_PW = process.env.ADMIN_PW;   // 관리자 확인용 암호

    if (password !== ADMIN_PW) return res.status(401).json({ error: 'Unauthorized' });

    const CONFIG = {
        owner: "uowol",
        repo: "ildan-website",
        path: "data/posts.json"
    };

    const apiUrl = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.path}`;

    try {
        // 1. 기존 데이터 가져오기
        const getRes = await fetch(apiUrl, {
            headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
        });
        const fileData = await getRes.json();
        const posts = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
        posts.push({ id: Date.now(), title, date: new Date().toISOString().split('T')[0], content });

        // 핵심 수정 부분: JSON.stringify 결과를 명확히 전달
        const updatedContent = JSON.stringify(posts, null, 2);
        const encodedContent = Buffer.from(updatedContent, 'utf8').toString('base64');

        const putRes = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `New post: ${title}`,
                content: encodedContent, // 이제 확실히 string이 전달됨
                sha: fileData.sha
            })
        });

        if (putRes.ok) res.status(200).json({ success: true });
        else throw new Error('GitHub API Error');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}