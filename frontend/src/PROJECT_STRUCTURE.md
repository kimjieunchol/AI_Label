# 라벨 번역 서비스 - 프로젝트 구조

## 📁 핵심 파일 구조

### 메인 파일
- `/App.tsx` - 메인 애플리케이션 로직 및 라우팅
- `/index.html` - HTML 엔트리 포인트
- `/package.json` - 프로젝트 의존성
- `/vite.config.ts` - Vite 설정
- `/tsconfig.json` - TypeScript 설정

### 컴포넌트 (`/components/`)
#### 페이지 컴포넌트
- `LoginPage.tsx` - 로그인 페이지
- `MainPage.tsx` - 메인 페이지 (이미지 업로드)
- `ResultPage.tsx` - 검증/번역 결과 페이지
- `MyPage.tsx` - 사용자 마이페이지 (프로필, 이력)
- `AdminPage.tsx` - 관리자 페이지 (사용자 관리, 전체 이력)
- `UserDetailPage.tsx` - 사용자 상세 페이지
- `ChangePasswordModal.tsx` - 비밀번호 변경 모달

#### UI 컴포넌트 (`/components/ui/`)
실제 사용 중인 컴포넌트:
- `button.tsx` - 버튼
- `input.tsx` - 입력 필드
- `card.tsx` - 카드
- `badge.tsx` - 배지
- `checkbox.tsx` - 체크박스
- `dialog.tsx` - 다이얼로그/모달
- `dropdown-menu.tsx` - 드롭다운 메뉴
- `tabs.tsx` - 탭
- `scroll-area.tsx` - 스크롤 영역
- `pagination.tsx` - 페이징
- `progress.tsx` - 프로그레스 바
- `label.tsx` - 레이블
- `utils.ts` - 유틸리티 함수

### 스타일
- `/styles/globals.css` - 전역 스타일 및 Tailwind 설정

## 🎯 주요 기능

### 1. 사용자 관리
- **로그인 시스템**: localStorage 기반 세션 관리
- **관리자 기능**: 사용자 생성/삭제
- **비밀번호 관리**: 첫 로그인 시 비밀번호 변경 필수
- **프로필 관리**: 비밀번호 변경 모달

### 2. 라벨 검증/번역
- **이미지 업로드**: 음료 라벨 이미지 업로드
- **FDA 규제 검증**: 고정 HTML 템플릿 기반 검증
- **다국어 번역**: 번역 기능 (검증과 동일한 UI)
- **HTML 편집**: contenteditable 기반 실시간 편집
- **하이라이팅**: JSON selector 기반 오류 위치 표시
- **HTML 다운로드**: 편집된 HTML 파일 다운로드

### 3. 이력 관리
- **마이페이지**: 개인 검증/번역 이력 (5개씩 페이징)
- **관리자 페이지**: 전체 이력 조회 (5개씩 페이징)
- **체크박스 선택 삭제**: 다중 선택 삭제 기능

## 🔧 기술 스택
- **React** + **TypeScript**
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **shadcn/ui** - UI 컴포넌트
- **localStorage** - 세션 관리

## 🚀 주요 흐름
1. 로그인 → MainPage (이미지 업로드)
2. 검증/번역 버튼 클릭 → ResultPage (HTML 편집 + 검증 결과)
3. 헤더 "라벨 번역 서비스" 클릭 → MainPage로 돌아가기
4. 마이페이지/관리자 페이지에서 이력 확인
