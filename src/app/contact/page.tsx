import type { Metadata } from 'next';
import { Header, Footer, ContactForm } from '@/components/moaon';
export const metadata: Metadata = { title: '프로젝트 문의', description: '모아온랩스와 함께 만들고 싶은 서비스를 이야기해주세요.' };
export default function ContactPage() { return <><Header/><main id="main" className="contact-page"><div className="container"><ContactForm/></div></main><Footer/></>; }
