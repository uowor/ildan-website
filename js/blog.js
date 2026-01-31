// 게시글 로드 (캐시 방지)
async function fetchPosts() {
    const rawUrl = `https://raw.githubusercontent.com/아이디/저장소/main/data/posts.json?t=${Date.now()}`;
    const res = await fetch(rawUrl);
    const posts = await res.json();
    window.allPosts = posts; // 모달을 위해 전역 저장

    const container = document.getElementById('blog-container');
    container.innerHTML = posts.reverse().map(post => `
        <div class="card" onclick="openPost(${post.id})">
            <small style="color: var(--primary)">${post.date}</small>
            <h3>${post.title}</h3>
            <p>${post.content.substring(0, 100)}...</p>
        </div>
    `).join('');
}

// 서버리스 API로 게시글 저장
async function savePost() {
    const password = document.getElementById('admin-pw').value;
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;

    const res = await fetch('/api/save-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, password })
    });

    if (res.ok) {
        alert("게시 완료!");
        location.reload();
    } else {
        alert("비밀번호가 틀렸거나 오류가 발생했습니다.");
    }
}

function openPost(id) {
    const post = window.allPosts.find(p => p.id === id);
    document.getElementById('modal-body').innerHTML = `
        <h1 style="margin-bottom: 1rem">${post.title}</h1>
        <small>${post.date}</small>
        <hr style="margin: 2rem 0; border: 0; border-top: 1px solid var(--border);">
        <div class="markdown-body">${marked.parse(post.content)}</div>
    `;
    document.getElementById('post-modal').style.display = 'flex';
}

function closeModal() { document.getElementById('post-modal').style.display = 'none'; }
function toggleAdmin() { const p = document.getElementById('admin-panel'); p.style.display = p.style.display === 'none' ? 'block' : 'none'; }

window.onload = fetchPosts;