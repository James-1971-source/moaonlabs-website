import type { Metadata } from 'next';
import './globals.css';
import { ExperienceEffects } from '@/components/experience-effects';
export const metadata: Metadata = { title: { default: '모아온랩스 | 생각을 모아, 가능성을 켜다', template: '%s | 모아온랩스' }, description: '인공지능을 활용해 일상에 쓰이는 서비스를 만듭니다. 페이지온북, 당작공, 홈페이지 제작, AI·IT 교육, 복지시설 홍보영상과 업무자동화.', metadataBase: new URL('https://moaonlabs.com'), robots: { index: true, follow: true }, icons: { icon: '/sites/moaon/favicon.svg' }, openGraph: { title: '모아온랩스', description: '생각을 모아, 가능성을 켜다. AI-powered, human-centered.', locale: 'ko_KR', type: 'website' } };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="ko"><body><a className="skip-link" href="#main">본문 바로가기</a>{children}<ExperienceEffects/></body></html>; }
