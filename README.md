# 제철산업 · 저류조 현장관리

현장 등록, 저류조 용량(ton), 영업담당자, 진행단계 및 체크리스트를 관리하는 웹사이트입니다.

## 포함 기능
- 현장 등록·수정·삭제 및 검색
- 용량(ton), 시공사, 영업담당자, 연락처와 주소 관리
- 9단계 진행상황과 진행 중·대기·완료·보류 상태 관리
- 세부 완료 항목 체크, 일정 및 D-day 표시
- JSON 백업 내보내기·불러오기
- Cloudflare D1에 현장 정보 저장

Google Maps 연동은 아직 포함되지 않았습니다.

## GitHub에 올리기
1. GitHub에서 새 저장소를 만듭니다.
2. 이 폴더를 압축 해제합니다.
3. 저장소의 **Add file → Upload files**에서 폴더 안의 파일과 하위 폴더를 올립니다.
4. **Commit changes**를 누릅니다.

Git 사용 시에는 이 폴더에서 다음 명령을 실행합니다. REPOSITORY_URL은 본인의 저장소 주소로 바꾸세요.

```bash
git init
git add .
git commit -m "Initial reservoir field manager"
git branch -M main
git remote add origin REPOSITORY_URL
git push -u origin main
```

## 로컬 실행
Node.js 22.13 이상과 package.json에 지정된 pnpm 버전이 필요합니다.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm build
```

첫 실행 전 테스트용 데이터베이스에 스키마를 적용합니다.

```bash
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_smiling_krista_starr.sql
pnpm dev
```

브라우저에서 터미널에 표시된 주소를 엽니다(기본 http://localhost:5173).
새 마이그레이션이 생기면 해당 SQL 파일도 순서대로 적용하세요.

## 주요 파일
- `app/source.html`: 화면, 현장 등록 및 진행상태 관리 코드
- `app/route.ts`: 첫 화면 응답
- `app/api/[[...path]]/route.ts`: 현장 조회·저장 API
- `db/schema.ts`, `drizzle/`: 데이터베이스 구조와 마이그레이션
- `.openai/hosting.json`: 기존 ChatGPT Sites 프로젝트 연결 및 DB 바인딩
- `worker/index.ts`: 서버 진입점

## 배포와 데이터
GitHub는 소스 보관용입니다. 이 프로젝트는 서버 API와 D1을 사용하므로 GitHub Pages에 파일만 올려서는 저장 기능이 작동하지 않습니다. 기존 ChatGPT Sites 배포 환경을 유지하거나, 별도의 Cloudflare Workers/D1 배포 설정이 필요합니다.

실제 등록된 현장 자료는 서버 데이터베이스에 있으며 이 소스 폴더에는 포함되지 않습니다. 자료를 옮기려면 운영 사이트의 ‘백업 내보내기’로 JSON을 별도로 내려받으세요.

현재 애플리케이션은 별도 관리자 인증 없이 수정 가능한 공동 편집 구조입니다. 기존 사이트의 공개 접속 설정은 소스 폴더와 별도로 관리됩니다.

의존성(node_modules), 빌드 결과물, 로컬 DB, Git 인증 정보, API 키는 포함하지 않았습니다.
