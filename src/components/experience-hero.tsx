'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, Box, Network, Pause, Play } from 'lucide-react';
import { useCallback, useState, useSyncExternalStore } from 'react';
import { services } from '@/lib/services';

const NeuralScene = dynamic(() => import('./neural-scene'), { ssr: false, loading: () => <div className="scene-loader" aria-hidden="true"><span /><span /><span /></div> });
const mediaQuery = '(prefers-reduced-motion: reduce)';
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia(mediaQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}
function getMotion() { return window.matchMedia(mediaQuery).matches; }
function getServerMotion() { return false; }

export function ExperienceHero() {
  const [mode, setMode] = useState<'core' | 'network'>('network');
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const reduced = useSyncExternalStore(subscribeMotion, getMotion, getServerMotion);
  const onReady = useCallback((value: boolean) => setReady(value), []);
  return <section className={`experience-hero experience-split ${mode === 'network' ? 'network-view' : 'core-view'}`} aria-labelledby="experience-title">
    <div className="experience-grain" aria-hidden="true" />
    <div className="experience-aura" aria-hidden="true" />
    <div className="experience-grid" aria-hidden="true" />
    <div className="container experience-content">
    <div className="experience-copy">
      <div className="experience-eyebrow"><span className="eyebrow-line" /><span>모아온랩스 <i /> INTELLIGENT DIGITAL STUDIO</span></div>
      <h1 id="experience-title">생각의 경계를 넘어,<br /><span>가능성을 <em>켜다.</em></span></h1>
      <p className="experience-description"><strong>인공지능으로, 현장과 일상에 쓰이는 서비스를 만듭니다.</strong><br />직접 만든 서비스부터 맡겨 주시는 제작과 교육까지.</p>
      <ul className="hero-offer" aria-label="모아온랩스가 하는 일">{[['콘티온', '영상 편집기', '/services/contion/'], ['페이지온북', '온라인 플립북', '/services/pageonbook/'], ['홈페이지 제작', '기관·브랜드', '/services/websites/'], ['AI·IT 교육', '학생·일반인', '/services/education/'], ['복지시설 홍보영상', '영상 제작', '/services/video/']].map(([n, d, h]) => <li key={h}><Link href={h}><b>{n}</b><span>{d}</span></Link></li>)}</ul>
      <div className="experience-actions"><a href="#services" className="button button-primary">우리의 서비스 <ArrowRight size={17} /></a><Link href="/contact/" className="experience-secondary">함께 만들기 <ArrowUpRight size={16} /></Link></div>
      <div className="experience-footnote"><span className="footnote-rule" /><span>AI-POWERED.<br /><b>HUMAN-CENTERED.</b></span></div>
    </div>
    <div className="experience-stage">
      <div className="scene-frame">
      <NeuralScene mode={mode} paused={paused || reduced} onReady={onReady} />
      <div className="scene-vignette" aria-hidden="true" />
      <div className="scene-coordinate coordinate-top" aria-hidden="true"><span>ML / INTELLIGENCE ENGINE</span><span>01 — {String(services.length).padStart(2, '0')}</span></div>
      <div className="scene-coordinate coordinate-bottom" aria-hidden="true"><span>{mode === 'core' ? 'IDEAS IN ORBIT' : 'POSSIBILITIES CONNECTED'}</span><span>THREE.JS / WEBGL</span></div>
      <span className="scene-reticle reticle-tl" aria-hidden="true" /><span className="scene-reticle reticle-br" aria-hidden="true" />
      </div>
      <nav className="spatial-services" aria-label="3D 서비스 허브">{services.map(s => <Link className={`spatial-link spatial-${s.slug}`} key={s.slug} href={`/services/${s.slug}/`}><span className="spatial-node" /><span className="spatial-number">{s.number}</span><span>{s.name}</span>{s.status === '준비 중' ? <small>준비 중</small> : <ArrowUpRight size={11} />}</Link>)}</nav>
    </div>
    </div>
    <div className="container experience-bottom"><div className="engine-caption"><span className={ready ? 'engine-dot active' : 'engine-dot'} /><span>{ready ? 'REAL-TIME 3D EXPERIENCE' : 'INTERACTIVE EXPERIENCE'}</span></div><div className="scene-controls" aria-label="3D 장면 조작"><div className="scene-mode-group" role="group" aria-label="3D 보기 방식"><button className={mode === 'core' ? 'selected' : ''} aria-pressed={mode === 'core'} onClick={() => setMode('core')}><Box size={13} />코어 뷰</button><button className={mode === 'network' ? 'selected' : ''} aria-pressed={mode === 'network'} onClick={() => setMode('network')}><Network size={13} />네트워크 뷰</button></div><button className="scene-play" onClick={() => setPaused(!paused)} disabled={reduced} aria-label={reduced ? '운영체제의 움직임 줄이기 설정 적용 중' : paused ? '3D 애니메이션 재생' : '3D 애니메이션 일시정지'} title={reduced ? '움직임 줄이기 설정 적용 중' : paused ? '재생' : '일시정지'}>{paused || reduced ? <Play size={13} /> : <Pause size={13} />}</button></div><a href="#services" className="experience-scroll"><span>EXPLORE THE POSSIBILITIES</span><ArrowDown size={15} /></a></div>
  </section>;
}
