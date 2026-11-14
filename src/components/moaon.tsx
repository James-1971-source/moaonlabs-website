'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, Copy, Film, GraduationCap, Layers, Mail, Menu, Monitor, Phone, Play, ShoppingBag, Workflow, X } from 'lucide-react';
import { company, services, type Service } from '@/lib/services';

export function Brand({ compact = false }: { compact?: boolean }) {
  return <span className={`brand ${compact ? 'brand-compact' : ''}`}><span className="brand-symbol" aria-hidden="true"><i /><i /><i /></span><span>moaon<span className="brand-light">labs</span><span className="brand-period">.</span></span></span>;
}

export function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  return <header className="site-header"><div className="header-inner"><Link href="/" aria-label="모아온랩스 홈" onClick={() => setOpen(false)}><Brand /></Link><nav className={open ? 'main-nav is-open' : 'main-nav'} aria-label="주요 메뉴" id="main-nav"><Link href="/#services" onClick={() => setOpen(false)}>서비스 <ChevronDown size={12} /></Link><Link href="/#approach" onClick={() => setOpen(false)}>만드는 방식</Link><Link href="/#about" onClick={() => setOpen(false)}>모아온랩스</Link><Link href="/contact" className="mobile-contact" onClick={() => setOpen(false)}>프로젝트 문의 <ArrowUpRight size={16} /></Link></nav><Link href="/contact" className="header-contact">함께 시작하기 <ArrowUpRight size={15} /></Link><button className="menu-button" aria-label={open ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div></header>;
}

export function ServiceIcon({ slug, size = 22 }: { slug: string; size?: number }) {
  const icons = { pageonbook: BookOpen, dangjakgong: ShoppingBag, websites: Monitor, education: GraduationCap, video: Film, automation: Workflow };
  const Icon = icons[slug as keyof typeof icons] || Layers;
  return <Icon size={size} strokeWidth={1.5} aria-hidden="true" />;
}

export function ServiceArt({ slug, large = false }: { slug: string; large?: boolean }) {
  return <div className={`service-art art-${slug} ${large ? 'art-large' : ''}`} aria-hidden="true">
    <span className="art-grid" />
    {slug === 'pageonbook' && <div className="book-scene"><div className="book-cover"><span>PAGEON<br />EDITION.</span><span className="book-cover-orbit" /><small>Stories worth<br />turning into pages.</small><span className="book-no">01 / 24</span></div><div className="book-page"><span>Good stories<br />stay with us.</span><i /><i /><i /><small>페이지를 넘어, 경험으로.</small></div></div>}
    {slug === 'dangjakgong' && <div className="shop-scene"><div className="shop-bag"><ShoppingBag size={45} strokeWidth={1} /><strong>당작공</strong><small>DANGJAKGONG</small></div><span className="shop-tag">네이버 스마트스토어 <ArrowUpRight size={12} /></span></div>}
    {slug === 'websites' && <div className="browser-scene"><div className="browser-top"><i /><i /><i /><span>your next experience</span></div><div className="browser-content"><div className="browser-nav"><b>hello.</b><span>work&nbsp;&nbsp; about&nbsp;&nbsp; contact</span></div><strong>Make something<br /><em>meaningful.</em></strong><div className="browser-circle" /><span className="browser-pill">Discover more ↗</span></div></div>}
    {slug === 'education' && <div className="learn-scene"><span className="learn-chip chip-ai">AI</span><span className="learn-chip chip-code">&lt;/&gt;</span><span className="learn-chip chip-create"><GraduationCap size={36} /></span><span className="learn-line" /><div className="learn-caption">LEARN. TRY. CREATE.</div></div>}
    {slug === 'video' && <div className="video-scene"><div className="video-screen"><span className="video-label">OUR EVERYDAY STORIES</span><span className="video-landscape" /><span className="video-play"><Play size={20} fill="currentColor" /></span><span className="video-caption">우리의 일상이, 하나의 이야기가 됩니다.</span></div><div className="video-timeline"><i /><i /><i /><i /><span /></div></div>}
    {slug === 'automation' && <div className="flow-scene"><span className="flow-line" /><div className="flow-node flow-start"><Layers size={20} /><small>현장의 업무</small></div><div className="flow-node flow-center"><Workflow size={26} /><small>가능성 연구</small></div><div className="flow-node flow-end"><Check size={20} /><small>더 나은 일상</small></div></div>}
  </div>;
}

export { ExperienceHero as Hero } from './experience-hero';

export function ServiceGrid() {
  const [filter, setFilter] = useState('전체');
  const filters = ['전체', '디지털 서비스', '제작 서비스', '교육', '준비 중'];
  const shown = services.filter(s => filter === '전체' || s.category === filter);
  return <section id="services" className="section services-section"><div className="container"><div className="section-heading"><div><p className="eyebrow muted">01 / WHAT WE MAKE</p><h2>하나의 생각에서,<br /><span className="subtle">다양한 가능성으로.</span></h2></div><p className="section-description">만들고, 배우고, 연결하고.<br />모아온랩스가 만들어가는 서비스를 만나보세요.</p></div><div className="filter-bar" role="group" aria-label="서비스 분류">{filters.map(f => <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f} className={filter === f ? 'filter active' : 'filter'}>{f}<span>{f === '전체' ? services.length : services.filter(s => s.category === f).length}</span></button>)}</div><div className="services-grid" aria-live="polite">{shown.map(s => <Link href={`/services/${s.slug}/`} className={`service-card card-${s.slug}`} key={s.slug}><div className="service-art-wrap"><ServiceArt slug={s.slug} /><span className={s.status === '준비 중' ? 'status-badge preparing' : 'status-badge'}><span />{s.status}</span><span className="card-go"><ArrowUpRight size={19} /></span></div><div className="card-body"><div className="card-kicker"><span>{s.english}</span><span>{s.number}</span></div><h3>{s.name}</h3><p>{s.description}</p><div className="card-bottom"><span>{s.tags[0]}</span><span>자세히 보기 <ArrowRight size={14} /></span></div></div></Link>)}</div><p className="services-note"><span className="live-dot" /> 계속해서 새로운 가능성을 만들고 있습니다.</p></div></section>;
}

export function Approach() {
  return <section id="approach" className="section approach-section"><div className="container"><div className="section-heading"><div><p className="eyebrow muted">02 / HOW WE THINK</p><h2>기술은 새롭게.<br /><span className="subtle">출발점은 언제나 사람.</span></h2></div><p className="section-description">화려한 기술보다, 실제로 도움이 되는 변화.<br />AI는 도구이고, 사람의 필요가 방향입니다.</p></div><div className="approach-grid">{[
    { n: '01', title: '먼저, 듣습니다.', text: '어떤 일을 하고 계신지, 무엇이 불편한지. 해결해야 할 진짜 문제를 함께 찾습니다.', icon: 'listen' },
    { n: '02', title: '작게 만들고, 확인합니다.', text: 'AI로 가능성을 빠르게 구현하고, 실제로 사용해 보며 더 나은 방향을 찾습니다.', icon: 'build' },
    { n: '03', title: '일상에 닿게 합니다.', text: '멋진 시연에서 끝나지 않도록. 현장에서 이해하고 쓸 수 있는 결과를 지향합니다.', icon: 'connect' },
  ].map(item => <article className="approach-card" key={item.n}><div className={`approach-drawing drawing-${item.icon}`} aria-hidden="true"><i /><i /><i /><span /></div><span className="mono-label">/ {item.n}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></div></section>;
}

export function About() {
  return <section id="about" className="section about-section"><div className="container about-layout"><div className="about-wordmark" aria-hidden="true"><span className="eyebrow">IDEAS COME TOGETHER.</span><span>moa<span>on</span><br />labs<span className="about-dot">.</span></span><div className="about-rule"><span>IDEAS</span><i /><span>REAL LIFE</span></div></div><div className="about-copy"><p className="eyebrow muted">03 / ABOUT MOAON LABS</p><h2>여러 생각을 모아,<br />우리의 일상에 <span>ON.</span></h2><p>모아온랩스는 인공지능을 활용해 다양한 서비스를 만들고 제공하는 사업자입니다.</p><p>플립북과 온라인 쇼핑몰, 홈페이지 제작과 IT 교육, 복지시설 홍보영상까지. 서로 다른 일들 사이에는 하나의 방향이 있습니다. 기술을 사람의 삶에 쓸모 있게 연결하는 것.</p><p>이제 복지 현장의 반복 업무를 덜어줄 자동화 서비스도 준비하고 있습니다. 우리가 만드는 다음 가능성도, 사람에게서 시작합니다.</p><Link href="/contact" className="text-link">모아온랩스와 이야기하기 <ArrowUpRight size={17} /></Link></div></div></section>;
}

export function ContactBanner() {
  return <section className="contact-banner"><div className="container contact-banner-inner"><div><p className="eyebrow">LET’S MAKE IT REAL.</p><h2>아직 아이디어여도,<br />괜찮습니다.</h2><p>필요한 서비스, 함께 만들고 싶은 변화.<br />그 이야기부터 들려주세요.</p></div><Link href="/contact" className="contact-circle"><ArrowUpRight size={36} strokeWidth={1.4} /><span>함께 시작하기</span></Link></div><span className="contact-orbit" aria-hidden="true" /></section>;
}

export function Footer() {
  return <footer className="site-footer"><div className="container"><div className="footer-top"><div><Link href="/" aria-label="모아온랩스 홈"><Brand /></Link><p>생각을 모아, 가능성을 켜다.</p></div><nav aria-label="하단 메뉴"><Link href="/#services">서비스</Link><Link href="/#about">모아온랩스</Link><Link href="/contact">프로젝트 문의 <ArrowUpRight size={13} /></Link></nav><div className="footer-contact"><a href={`mailto:${company.email}`}>{company.email} <ArrowUpRight size={13} /></a><a href={`tel:${company.phone.replaceAll('-', '')}`}>{company.phone}</a></div></div><div className="footer-legal"><div><span>상호: {company.name}</span><span>대표: {company.representative}</span><span>사업자등록번호: {company.registration}</span><span>{company.location}</span></div><div><span>© {new Date().getFullYear()} MOAON LABS.</span><Link href="/privacy/">개인정보 안내</Link></div></div></div></footer>;
}

export function ServiceDetail({ service }: { service: Service }) {
  const other = services.filter(s => s.slug !== service.slug).slice(0, 3);
  return <><Header /><main id="main"><section className={`detail-hero detail-${service.slug}`}><div className="container"><nav className="breadcrumbs" aria-label="현재 위치"><Link href="/">홈</Link><span>/</span><Link href="/#services">서비스</Link><span>/</span><span aria-current="page">{service.name}</span></nav><div className="detail-hero-grid"><div><div className="detail-eyebrow"><span className="eyebrow muted">{service.number} / {service.english}</span><span className={service.status === '준비 중' ? 'inline-status preparing' : 'inline-status'}><span />{service.status}</span></div><h1>{service.tagline.split('\n').map((l,i) => <span key={l} className={i ? 'subtle' : ''}>{l}<br /></span>)}</h1><p className="detail-name"><ServiceIcon slug={service.slug} />{service.name}</p><p className="detail-intro">{service.description}</p><div className="detail-actions">{service.external ? <a className="button button-primary" href={service.external} target="_blank" rel="noopener noreferrer">{service.externalLabel} <ArrowUpRight size={17} /><span className="sr-only"> (새 탭)</span></a> : <Link href={`/contact/?service=${service.slug}`} className="button button-primary">{service.status === '준비 중' ? '현장의 필요 이야기하기' : '이 서비스 문의하기'} <ArrowUpRight size={17} /></Link>}{service.external && <Link href={`/contact/?service=${service.slug}`} className="button button-outline">서비스 문의 <ArrowRight size={16} /></Link>}</div></div><div className="detail-art"><ServiceArt slug={service.slug} large /><span className="illustration-label">서비스 콘셉트 일러스트 · 실제 이용 화면이 아닙니다</span></div></div></div></section><section className="detail-body section"><div className="container detail-content-grid"><aside><p className="eyebrow muted">OVERVIEW</p><h2>{service.name}</h2><div className="detail-tags">{service.tags.map(t=><span key={t}>{t}</span>)}</div></aside><div><p className="detail-lead">{service.detail}</p><div className="feature-list">{service.features.map((f,i)=><article key={f.title}><span>0{i+1}</span><div><h3>{f.title}</h3><p>{f.text}</p></div></article>)}</div><div className="audience-box"><h3>이런 분들과 연결됩니다</h3><ul>{service.audience.map(a=><li key={a}><Check size={15}/>{a}</li>)}</ul></div><h3 className="process-heading">{service.status === '준비 중' ? '준비 방향' : '이용·진행 흐름'}</h3><div className="detail-steps">{service.steps.map((s,i)=><div key={s}><span>0{i+1}</span><p>{s}</p></div>)}</div><p className="detail-note"><strong>안내</strong>{service.note}</p><div className="detail-final-cta"><div><h3>{service.status === '준비 중' ? '어떤 업무가 가장 번거로우신가요?' : '더 궁금한 점이 있으신가요?'}</h3><p>{service.status === '준비 중' ? '현장의 이야기가 다음 서비스를 만드는 출발점입니다.' : '목적과 상황을 알려주시면 함께 방향을 살펴보겠습니다.'}</p></div><Link href={`/contact/?service=${service.slug}`} className="button button-outline">이야기 나누기 <ArrowUpRight size={16}/></Link></div></div></div></section><section className="related-section"><div className="container"><div className="related-heading"><h2>또 다른 가능성</h2><Link href="/#services" className="text-link">모든 서비스 <ArrowRight size={16}/></Link></div><div className="related-grid">{other.map(s=><Link key={s.slug} href={`/services/${s.slug}/`}><ServiceIcon slug={s.slug}/><div><span>{s.category}</span><h3>{s.name}</h3></div><ArrowUpRight size={19}/></Link>)}</div></div></section></main><Footer /></>;
}

export function ContactForm({ initialService = '' }: { initialService?: string }) {
  const urlService = useSyncExternalStore(() => () => {}, () => new URLSearchParams(window.location.search).get('service') || '', () => '');
  const [chosen,setTopic] = useState<string | null>(null);
  const topic = chosen ?? (services.some(s => s.slug === urlService) ? urlService : initialService);
  const [name,setName] = useState('');
  const [message,setMessage] = useState('');
  const [copied,setCopied] = useState(false);
  const serviceName = services.find(s=>s.slug === topic)?.name || '프로젝트 상담';
  const body = `안녕하세요, 모아온랩스 담당자님.\n\n관심 서비스: ${serviceName}\n이름 / 기관: ${name}\n\n문의 내용:\n${message}\n\n회신받을 연락처는 이 메일에 직접 적어주세요.`;
  const mailHref = `mailto:${company.email}?subject=${encodeURIComponent(`[모아온랩스 문의] ${serviceName}`)}&body=${encodeURIComponent(body)}`;
  async function copyEmail() { try { await navigator.clipboard.writeText(company.email); setCopied(true); setTimeout(()=>setCopied(false),2500); } catch { setCopied(false); } }
  function downloadBrief() { const blob=new Blob([body],{type:'text/plain;charset=utf-8'}); const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='모아온랩스_문의내용.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
  return <div className="contact-layout"><div className="contact-info"><p className="eyebrow muted">LET’S TALK</p><h1>어떤 가능성을<br /><span className="subtle">함께 켜볼까요?</span></h1><p>구체적인 계획이 없어도 괜찮습니다.<br />필요한 일과 바꾸고 싶은 일상을 들려주세요.</p><div className="direct-contact"><a href={`mailto:${company.email}`}><Mail size={20}/><span><small>EMAIL</small>{company.email}</span><ArrowUpRight size={18}/></a><a href={`tel:${company.phone.replaceAll('-', '')}`}><Phone size={20}/><span><small>PHONE</small>{company.phone}</span><ArrowUpRight size={18}/></a><button onClick={copyEmail} className="copy-email"><Copy size={14}/>{copied ? '이메일 주소를 복사했습니다' : '이메일 주소 복사'}</button><span role="status" className="sr-only">{copied ? '이메일 주소가 복사되었습니다.' : ''}</span></div><div className="contact-safety"><span className="live-dot"/><p>이 페이지는 입력 내용을 서버로 전송하거나 저장하지 않습니다. 민감정보나 아동 개인정보는 적지 말아주세요.</p></div></div><div className="contact-form-panel"><div className="form-heading"><span className="mono-label">PROJECT BRIEF</span><span>이야기의 시작</span></div><label htmlFor="topic">어떤 서비스에 관심이 있으신가요?</label><select id="topic" value={topic} onChange={e=>setTopic(e.target.value)}><option value="">아직 정하지 않았어요 / 기타 문의</option>{services.map(s=><option key={s.slug} value={s.slug}>{s.name}{s.status === '준비 중' ? ' (준비 중)' : ''}</option>)}</select><label htmlFor="contact-name">이름 또는 기관명 <span>(선택)</span></label><input id="contact-name" value={name} maxLength={100} onChange={e=>setName(e.target.value)} autoComplete="organization" placeholder="어떻게 불러드리면 될까요?"/><label htmlFor="contact-message">함께 만들고 싶은 것 <span>(선택)</span></label><textarea id="contact-message" value={message} maxLength={1800} onChange={e=>setMessage(e.target.value)} rows={6} placeholder="필요한 서비스, 현재의 어려움, 대상이나 일정 등 편하게 적어주세요."/><p className="mail-explanation">아래 버튼을 누르면 작성한 내용과 함께 기본 메일 앱이 열립니다. <strong>메일 앱에서 직접 전송해야 문의가 접수됩니다.</strong></p><a href={mailHref} className="button button-primary send-mail">메일 앱에서 문의 보내기 <ArrowUpRight size={18}/></a><button className="download-brief" onClick={downloadBrief}>메일 앱이 없나요? 작성 내용 내려받기 <ArrowRight size={14}/></button><p className="form-note">이메일 주소로 직접 보내셔도 됩니다. 가격·일정은 상담 후 협의합니다.</p></div></div>;
}
