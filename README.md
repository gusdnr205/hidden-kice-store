# Hidden Kice Store

첨부 레퍼런스의 히든카이스 스토어를 구현한 Next.js 포트폴리오 프로젝트입니다.

운영 사이트: https://hidden-kice-store-ten.vercel.app · [구현 및 검증 결과](DELIVERY.md)

## 실행

Node.js 20.9 이상에서 실행합니다.

```sh
npm ci
npm run dev
```

http://localhost:3000 에서 확인합니다. 배포 빌드는 `npm run build`, 타입 검사는 `npm run typecheck`입니다.

## 구현 범위

- 반응형 헤더, 5개 배너를 전환하는 히어로, 4열/모바일 2열 상품 목록
- 교재명 및 과목 검색, 전체/패스/단권 필터, 12개씩 페이지 이동
- 상품 상세 모달, 장바구니 추가/수량 변경/삭제 및 브라우저 로컬 저장
- 로딩 스켈레톤, 검색 결과 없음, 네트워크 오류 및 재시도
- Supabase 상품 CSR 조회, 공개 읽기만 허용하는 RLS와 36개 초기 데이터
- 키보드 조작, 네이티브 dialog 포커스 관리, 스크린리더 레이블

계정, AI OMR, 주문/결제는 과제 화면 범위 밖이며 안내 화면만 제공합니다. 교재 이미지는 외부 원본 파일 없이 CSS로 재구성했습니다. 원본 고해상도 이미지가 제공되면 `BookArt` 컴포넌트를 실제 이미지로 교체하면 됩니다.

## Supabase 생성 및 연결

1. Supabase에서 새 프로젝트를 만듭니다. 비용이 발생하는 플랜은 필요하지 않습니다.
2. SQL Editor에서 `supabase/migrations/001_products.sql` 전체를 실행합니다.
3. `.env.example`을 `.env.local`로 복사합니다.
4. Project Settings의 Data API URL과 공개 anon 키(또는 publishable key)를 입력합니다.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_KEY
```

**service_role 또는 secret 키는 절대 넣지 않습니다.** 상품은 공개 데이터로 SELECT만 허용하며 브라우저에서 쓰기 권한이 없습니다. 환경변수가 없으면 명시된 데모 모드로 동작합니다. 두 변수가 설정되면 `useEffect → getProducts → Supabase SELECT`로 가져옵니다. 실제 연결 실패 시 데모 데이터로 숨기지 않고 오류를 표시합니다. SQL의 36개 데이터와 로컬 데모 데이터는 일치합니다.

## 확장 가능한 폴더 구조

```text
src/
  app/                 # App Router, 메타데이터, 전역 스타일
  components/          # 스토어 화면과 재사용 교재 아트
  lib/                 # Supabase 클라이언트, 상품 타입와 데모 데이터
  services/            # 데이터 접근 계층
supabase/migrations/   # 스키마, RLS, 초기 데이터
```

화면과 데이터 접근을 분리했습니다. 상품 상세 라우트, 회원 인증, 주문 도메인을 추가할 때 `services/`와 기능별 컴포넌트로 확장할 수 있습니다. 현재 규모에서는 검색/필터/페이지네이션을 한 번 받아온 공개 상품 목록에 적용합니다. 데이터가 많아지면 `getProducts`에 검색 조건과 페이지를 전달하고 Supabase의 `range`, `count` 조회로 변경할 수 있습니다. 장바구니는 서버 주문과 분리된 로컬 상태입니다.

## GitHub 및 Vercel

프로젝트 폴더를 새 GitHub 저장소의 루트로 업로드합니다. `node_modules`, `.next`, `.env.local`은 업로드하지 않습니다.

Vercel에서 **Add New → Project → GitHub 저장소 Import**를 선택합니다. Framework는 Next.js, Build Command는 `npm run build`입니다. 위 두 공개 환경변수를 Production/Preview에 등록한 후 Deploy합니다. 환경변수 변경 후에는 Redeploy가 필요합니다. Vercel에서 기본으로 제공하는 HTTPS 주소로 접근할 수 있습니다.

로컬 프로젝트에 이미 Git 저장소가 있을 경우 기존 부모 프로젝트와 혼동하지 않도록 이 폴더만 별도 저장소로 사용합니다.

## 참고

- [Next.js 공식 설치 문서](https://nextjs.org/docs/app/getting-started/installation)
- [Supabase select 공식 문서](https://supabase.com/docs/reference/javascript/select)

이 프로젝트는 비공식 UI 구현물이며 실제 상점이나 공식 서비스가 아닙니다. 첨부 문서의 이메일 제출 안내에 따른 발송은 수행하지 않습니다.
