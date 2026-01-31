
# 🚀 Portfolio Website Project RD (Updated 2026.01.31)

## 1. 개요

* **목적**: Vercel 및 GitHub API를 활용한 서버리스 개인 포트폴리오 및 기술 블로그 운영
* **타겟**: 채용 담당자, 동료 개발자, 기술 지식 공유 대상자
* **기술 스택**:
* **Frontend**: HTML5, CSS3, Vanilla JavaScript
* **Backend**: Vercel Serverless Functions (Node.js)
* **Database**: GitHub Repository (JSON based)
* **Deployment**: Vercel (CI/CD 연동)



---

## 2. 주요 기능 및 페이지

### 🏠 메인 페이지 (index.html)

* [x] 자기소개 Hero 섹션 (한 줄 소개 및 CTA 버튼)
* [x] **실시간 최신 소식**: `data/posts.json`에서 최신 글 3개 동적 로드 로직 구현
* [ ] 핵심 기술 스택 아이콘 리스트 시각화

### 📂 프로젝트 페이지 (projects.html)

* [x] 카드 형태의 프로젝트 리스트 UI 레이아웃
* [x] **데이터 기반 렌더링**: JS 객체를 활용한 동적 카드 생성 로직
* [ ] 프로젝트 카테고리별 필터링 기능 (Frontend, Backend 등)

### ✍️ 블로그 페이지 (blog.html)

* [x] **실시간 데이터 로드**: GitHub Raw 데이터를 활용한 캐시 우회 로드
* [x] **마크다운 렌더링**: `Marked.js`를 이용한 본문 가독성 확보
* [x] **상세 보기**: 모달(Modal) UI를 통한 게시글 본문 출력
* [x] **관리자 CMS**:
* 서버리스 API(`api/save-post.js`)를 통한 안전한 글 작성
* **이미지 업로드**: API를 통한 GitHub 자동 커밋 및 마크다운 링크 삽입



---

## 3. 아키텍처 및 보안

* **보안**: GitHub Token을 클라이언트 코드에서 제거하고 Vercel 환경 변수(`Environment Variables`)로 관리
* **실시간성**: `raw.githubusercontent.com` 호출 시 타임스탬프 파라미터를 사용해 CDN 캐시 문제 해결
* **데이터 무결성**: Base64 인코딩 및 SHA 체크를 통한 GitHub 파일 업데이트 로직 적용

---

## 4. 디자인 가이드

* **컨셉**: 미니멀리즘, 깨끗한 화이트톤, 코드 가독성 중점
* **폰트**: Pretendard (CDN 적용 권장)
* **컴포넌트**: 카드 디자인(Shadow 효과), 모달 팝업, 반응형 네비게이션 바

---

## 5. 마일스톤 (단계별 목표)

* [x] **1단계**: 기본 HTML 구조 및 네비게이션 연결
* [x] **2단계**: 공통 CSS 레이아웃 및 카드 UI 적용
* [x] **3단계**: Vercel 서버리스 환경 구축 및 보안(Token) 이관
* [x] **4단계**: 마크다운 렌더링 및 이미지 업로드 API 구현
* [ ] **5단계**: (진행 중) 프로젝트 데이터 최신화 및 상세 필터링 추가
* [ ] **6단계**: 다크모드 지원 및 최종 SEO(검색엔진) 최적화
