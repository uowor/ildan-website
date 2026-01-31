// js/index.js
async function loadRecentPosts() {
    const CONFIG = {
        USER: "당신의_아이디",
        REPO: "당신의_저장소명",
        PATH: "data/posts.json"
    };

    const rawUrl = `https://raw.githubusercontent.com/${CONFIG.USER}/${CONFIG.REPO}/main/${CONFIG.PATH}?t=${new Date().getTime()}`;
    const container = document.getElementById('recent-posts');

    try {
        const res = await fetch(rawUrl);
        const posts = await res.json();

        // 최신순 3개만 추출
        const recent = posts.slice(-3).reverse();

        container.innerHTML = recent.map(post => `
            <div class="mini-card" onclick="location.href='blog.html'">
                <h4>${post.title}</h4>
                <small>${post.date}</small>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = "<p>최신 글을 불러올 수 없습니다.</p>";
    }
}

window.onload = loadRecentPosts;