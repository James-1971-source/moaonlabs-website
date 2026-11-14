# 모아온랩스 웹사이트 · Immersive Edition 2.0

AI-powered, human-centered 서비스 스튜디오의 로컬 검토본입니다. 공개 배포하지 않았습니다.

## 실행
Node.js 24 이상이 필요합니다.

```text
npm ci
npm run check
npm run start
```

브라우저: http://127.0.0.1:8928/
개발 모드: npm run dev

## 실시간 3D 업그레이드
- Three.js WebGL: 셰이더 코어·3중 궤도·6개 위성·입자
- 코어/네트워크 모드 전환, 포인터·스크롤 반응
- 일시정지·OS 움직임 줄이기·화면 밖 렌더링 중지
- WebGL 컨텍스트 손실 시 기본 안내와 복구
- 카드 원근·포인터 조명·스크롤 등장 연출
- 모바일 경량화 및 데스크톱/모바일 프레임 상한

## 구성
- 메인: 브랜드 소개, 서비스 6개 카드, 분류 필터, 제작 방식, 회사 소개, 문의 연결
- 상세: /services/pageonbook/, /services/dangjakgong/, /services/websites/, /services/education/, /services/video/, /services/automation/
- 문의: /contact/ (서비스 상세에서 이동하면 관심 서비스 자동 선택)
- 개인정보 안내: /privacy/
- 외부 연결: 페이지온북 https://pageonbook.kr/ (새 탭)

## 중요한 운영 구분
- 페이지온북, 당작공, 홈페이지 제작, AI·IT 교육, 복지시설 홍보영상은 사용자가 운영 중이라고 제공한 사업입니다.
- 복지시설 업무자동화는 준비 중입니다. 기능·가격·출시일을 확정하지 않았습니다.
- 당작공은 운영 중이나 정확한 공식 스토어 URL은 확인되지 않아 임의 링크를 넣지 않았습니다.
- 문의 화면은 서버 접수가 아닙니다. 입력 내용을 메일 앱에 전달하며 사용자가 메일 앱에서 직접 발송해야 합니다. 메일 앱이 없으면 작성 내용을 TXT로 내려받을 수 있습니다.
- 입력 내용을 서버에 저장하지 않습니다. 광고·분석 도구·외부 임베드를 추가하지 않았습니다.
- 서비스 그림은 자체 제작 콘셉트 일러스트입니다. 실제 제품 화면이나 실적 이미지가 아닙니다.

## 내용 수정
서비스: src/lib/services.ts
공통 UI: src/components/moaon.tsx
디자인: src/app/globals.css
검색 메타정보: src/app/layout.tsx

서비스를 추가할 때 services 배열에 항목을 추가하면 메인 카드, 상세 경로, 문의 선택 항목이 함께 확장됩니다. 분류는 현재 정의된 범주를 사용하세요.

## 공개 배포 전 확인
1. 당작공 공식 스마트스토어 주소
2. 공개 도메인·호스팅·HTTPS와 이메일 회신 환경
3. 소개 문구·제작 범위·정식 로고 승인
4. 개인정보 고지·접속 로그·필요한 사업자 표시 사항 최종 점검
5. 실적 영상·기관 사진을 추가한다면 공개 동의와 권리 확인
6. 공개 승인 뒤 layout.tsx의 robots 설정을 실제 운영 정책에 맞게 변경 (현재 검색 색인 방지)

## 기술 및 출처
JCodesMore/ai-website-cloner-template v0.6.1을 내려받아 그 Next.js 기반 위에 제작했습니다. 원본의 Map → Observe → Build → Compare 작업 지침을 적용한 브랜드 재구성입니다. 원본 사이트를 1:1 복제했다고 주장하지 않습니다.
원본: https://github.com/JCodesMore/ai-website-cloner-template (MIT, LICENSE 유지)
디자인 참고: https://linear.app/ , https://vercel.com/
타사 로고·문구·제품 이미지를 가져오지 않았습니다.
폰트: Pretendard 1.3.9, SIL OFL 1.1 (public/fonts/LICENSE-Pretendard.txt)
입체 그래픽 및 서비스 일러스트: 이번 프로젝트에서 자체 제작
