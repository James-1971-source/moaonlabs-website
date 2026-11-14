import Link from 'next/link';
import { Header, Footer } from '@/components/moaon';
export default function NotFound() { return <><Header/><main id="main" className="not-found container"><p className="eyebrow muted">404 / A NEW DIRECTION</p><h1>아직 열리지 않은<br/>가능성입니다.</h1><p>페이지 주소를 다시 확인하거나, 서비스 목록에서 찾아보세요.</p><Link className="button button-primary" href="/">홈으로 돌아가기 ↗</Link></main><Footer/></>; }
