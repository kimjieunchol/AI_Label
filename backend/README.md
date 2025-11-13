# Label AI Backend

음료 라벨 번역 및 FDA 규제 검증 서비스 백엔드

## 기술 스택

- Java 17
- Spring Boot 3.2.0
- Spring Data JPA
- Spring Security + JWT
- H2 Database (개발) / MySQL (운영)

## 실행 방법

\\\ash
# 프로젝트 빌드
mvn clean install

# 애플리케이션 실행
mvn spring-boot:run
\\\

## API 엔드포인트

### 인증 API
- POST /api/auth/login - 로그인
- POST /api/auth/logout - 로그아웃

### 사용자 API
- GET /api/user/profile - 프로필 조회
- PUT /api/user/password - 비밀번호 변경
- GET /api/user/history - 이력 조회

### 관리자 API
- GET /api/admin/users - 사용자 목록
- POST /api/admin/users - 사용자 생성
- DELETE /api/admin/users/{id} - 사용자 삭제
- GET /api/admin/history - 전체 이력 조회

### 라벨 API
- POST /api/label/upload - 이미지 업로드
- POST /api/label/validate - FDA 검증
- POST /api/label/translate - 번역

## 환경 설정

\pplication.yml\에서 다음 항목을 설정하세요:

- 데이터베이스 연결 정보
- JWT 시크릿 키
- 외부 API URL (RAG, LLM)
- 파일 업로드 경로
