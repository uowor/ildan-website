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

/* js/blog.js - Vercel API용 완전한 저장 로직 */

async function savePost() {
    const password = document.getElementById('admin-pw').value;
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;

    if (!password || !title || !content) {
        return alert("모든 항목을 입력해주세요.");
    }

    // 로딩 표시 (선택 사항)
    const saveBtn = document.querySelector('.btn-save');
    saveBtn.innerText = "전송 중...";
    saveBtn.disabled = true;

    try {
        // GitHub API가 아닌, 내 사이트의 Vercel 서버리스 함수로 요청
        const response = await fetch('/api/save-post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert("🎉 블로그 게시 성공! (GitHub 저장소에 반영 중)");
            location.reload();
        } else {
            throw new Error(result.error || "비밀번호가 틀렸거나 서버 오류가 발생했습니다.");
        }
    } catch (err) {
        alert("에리 발생: " + err.message);
    } finally {
        saveBtn.innerText = "서버로 전송";
        saveBtn.disabled = false;
    }
}

async function uploadImage() {
    const fileInput = document.getElementById('image-input');
    const password = document.getElementById('admin-pw').value;
    const status = document.getElementById('upload-status');
    const textarea = document.getElementById('post-content');

    if (!password) return alert("이미지를 업로드하려면 관리자 비밀번호가 필요합니다.");
    if (!fileInput.files[0]) return;

    const file = fileInput.files[0];
    const fileName = `img_${Date.now()}_${file.name.replace(/\s/g, '_')}`;

    status.innerText = "이미지 업로드 중...";

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const base64Content = reader.result.split(',')[1];

        try {
            const res = await fetch('/api/upload-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName, content: base64Content, password })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                const imgMarkdown = `\n![${file.name}](${data.url})\n`;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + imgMarkdown + textarea.value.substring(end);
                status.innerText = "✅ 업로드 완료";
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            status.innerText = "❌ 실패";
            alert("이미지 업로드 에러: " + err.message);
        }
    };
}

window.onload = fetchPosts;