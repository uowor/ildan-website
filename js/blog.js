const CONFIG = {
    USER: "uowor",
    REPO: "ildan-website",
    BRANCH: "main",
    PATH: "data/posts.json"
};

let allPosts = []; // 메모리상에 포스트 저장

// 1. 데이터 로드 및 렌더링
async function fetchPosts() {
    const rawUrl = `https://raw.githubusercontent.com/${CONFIG.USER}/${CONFIG.REPO}/${CONFIG.BRANCH}/${CONFIG.PATH}?t=${new Date().getTime()}`;
    const container = document.getElementById('blog-container');

    try {
        const res = await fetch(rawUrl);
        allPosts = await res.json();

        container.innerHTML = allPosts.slice().reverse().map(post => `
            <div class="post-card" onclick="openPost(${post.id})">
                <small>${post.date}</small>
                <h3>${post.title}</h3>
                <p>${post.content.substring(0, 100)}...</p>
                <span class="read-more">더 읽기 →</span>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = "<p>데이터를 불러오는 데 실패했습니다. data/posts.json 파일이 있는지 확인하세요.</p>";
    }
}

// 2. 상세 보기 모달 열기
function openPost(id) {
    const post = allPosts.find(p => p.id === id);
    if (!post) return;

    const modal = document.getElementById('post-modal');
    const body = document.getElementById('modal-body');

    // Marked.js를 이용해 마크다운을 HTML로 변환
    body.innerHTML = `
        <small>${post.date}</small>
        <h1>${post.title}</h1>
        <hr>
        <div class="content">${marked.parse(post.content)}</div>
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 스크롤 방지
}

function closeModal() {
    document.getElementById('post-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 3. 관리자 기능
function toggleAdmin() {
    const panel = document.getElementById('admin-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

// 4. 이미지 업로드 로직
async function uploadImage() {
    const fileInput = document.getElementById('image-input');
    const token = document.getElementById('gh-token').value;
    const status = document.getElementById('upload-status');
    const textarea = document.getElementById('post-content');

    if (!token) return alert("이미지를 업로드하려면 토큰이 필요합니다.");
    if (!fileInput.files[0]) return;

    const file = fileInput.files[0];
    const fileName = `img_${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const uploadPath = `assets/images/${fileName}`;
    const apiUrl = `https://api.github.com/repos/${CONFIG.USER}/${CONFIG.REPO}/contents/${uploadPath}`;

    status.innerText = "업로드 중...";

    // 파일을 Base64로 읽기
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const content = reader.result.split(',')[1];

        try {
            const res = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Upload image: ${fileName}`,
                    content: content
                })
            });

            if (res.ok) {
                const data = await res.json();
                // raw 주소로 마크다운 이미지 태그 삽입
                const rawImageUrl = `https://raw.githubusercontent.com/${CONFIG.USER}/${CONFIG.REPO}/${CONFIG.BRANCH}/${uploadPath}`;
                const imgMarkdown = `\n![${file.name}](${rawImageUrl})\n`;

                // 텍스트 커서 위치에 삽입
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + imgMarkdown + textarea.value.substring(end);

                status.innerText = "✅ 업로드 완료!";
            } else {
                throw new Error("업로드 실패");
            }
        } catch (err) {
            status.innerText = "❌ 실패";
            alert("이미지 업로드 에러: " + err.message);
        }
    };
}

async function savePost() {
    const token = document.getElementById('gh-token').value;
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;

    if (!token || !title || !content) return alert("모든 항목을 입력해주세요.");

    const apiUrl = `https://api.github.com/repos/${CONFIG.USER}/${CONFIG.REPO}/contents/${CONFIG.PATH}`;

    try {
        // 기존 파일 SHA 정보 가져오기
        const fileRes = await fetch(apiUrl, { headers: { 'Authorization': `token ${token}` } });
        const fileData = await fileRes.json();
        const posts = JSON.parse(decodeURIComponent(escape(atob(fileData.content))));

        // 새 데이터 추가
        const newPost = {
            id: Date.now(),
            title,
            date: new Date().toISOString().split('T')[0],
            content
        };
        posts.push(newPost);

        // 업데이트 요청
        const updateRes = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add post: ${title}`,
                content: btoa(unescape(encodeURIComponent(JSON.stringify(posts, null, 2)))),
                sha: fileData.sha
            })
        });

        if (updateRes.ok) {
            alert("게시 성공! 잠시 후 데이터가 동기화됩니다.");
            location.reload();
        } else {
            throw new Error("업데이트 실패");
        }
    } catch (err) {
        alert("에러 발생: 토큰 권한이나 경로를 확인하세요.");
        console.error(err);
    }
}

window.onload = fetchPosts;