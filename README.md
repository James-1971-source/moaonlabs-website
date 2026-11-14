# 모아온랩스 공식 웹사이트

https://moaonlabs.com · 생각을 모아, 가능성을 켜다.

모아온랩스가 운영하는 서비스(페이지온북, 당작공, 홈페이지 제작, AI·IT 교육, 복지시설 홍보영상, 업무자동화)를 소개하고 각 서비스 사이트로 연결하는 웹사이트입니다.

## 구성
- Next.js 16 (정적 사이트로 출력) · React 19 · Three.js 3D 히어로 · Tailwind CSS
- 서비스 목록과 회사 정보: `src/lib/services.ts` (서비스 추가·수정은 이 파일만 고치면 됩니다)
- 화면 구성: `src/components/moaon.tsx`, 3D 장면: `src/components/neural-scene.tsx`

## 수정과 배포
1. 내용 수정 후 `main` 브랜치에 올리면 GitHub Actions가 자동으로 빌드해 GitHub Pages에 배포합니다(약 2~3분).
2. 로컬 확인: `npm install` → `npm run dev` → http://127.0.0.1:8928
3. 검사: `npm run check` (린트·타입·빌드)

## 도메인
- `moaonlabs.com`(가비아). `public/CNAME`에 도메인이 들어 있습니다.
- 가비아 DNS: A 레코드 4개(185.199.108.153 / .109.153 / .110.153 / .111.153), `www` CNAME → `james-1971-source.github.io`
- 메일(하이웍스) MX 레코드는 그대로 둡니다.

## 참고
- 이 프로젝트는 MIT 라이선스의 웹사이트 템플릿에서 시작했습니다(`LICENSE`, 원본 설명: `docs/README-template.md`).
- 문의는 서버 없이 방문자의 메일 앱으로 보내는 방식입니다.
