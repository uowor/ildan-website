// 1. 프로젝트 데이터 (데이터베이스 역할)
const projects = [
    {
        title: "개인 포트폴리오 사이트",
        category: "Frontend",
        description: "HTML/CSS/Vanilla JS로 제작한 정적 사이트입니다.",
        tech: ["HTML", "CSS", "JS"],
        link: "https://github.com/..."
    },
    {
        title: "날씨 앱",
        category: "Frontend",
        description: "OpenWeather API를 활용한 실시간 날씨 정보 앱",
        tech: ["JS", "API"],
        link: "#"
    },
    {
        title: "간이 서버 API",
        category: "Backend",
        description: "Node.js를 이용한 기본 CRUD 게시판 API",
        tech: ["Node.js", "Express"],
        link: "#"
    }
];

// 2. 화면에 프로젝트 카드를 렌더링하는 함수
function displayProjects(data) {
    const grid = document.getElementById('project-grid');
    grid.innerHTML = data.map(project => `
        <div class="card">
            <span class="category-tag">${project.category}</span>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="tech-stack">
                ${project.tech.map(t => `<span>#${t}</span>`).join('')}
            </div>
            <a href="${project.link}" target="_blank" class="btn">View Code</a>
        </div>
    `).join('');
}

// 3. 필터링 로직
function filterProjects(category) {
    if (category === 'all') {
        displayProjects(projects);
    } else {
        const filtered = projects.filter(p => p.category === category);
        displayProjects(filtered);
    }
}

// 초기 실행
window.onload = () => displayProjects(projects);