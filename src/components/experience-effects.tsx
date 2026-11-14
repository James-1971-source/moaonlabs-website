'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ExperienceEffects() {
  const pathname = usePathname();
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const root = document.documentElement;
    let scrollFrame = 0;
    let pointerFrame = 0;
    let currentCard: HTMLElement | null = null;
    let pointerEvent: PointerEvent | null = null;
    const revealTargets = '.section-heading, .service-card, .approach-card, .about-layout, .contact-banner-inner, .detail-art, .feature-list article';
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    const register = () => {
      if (reduced.matches) return;
      document.querySelectorAll<HTMLElement>(revealTargets).forEach(element => {
        if (element.classList.contains('motion-reveal')) return;
        element.classList.add('motion-reveal');
        observer.observe(element);
      });
    };
    register();
    const mutations = new MutationObserver(register);
    const main = document.querySelector('main');
    if (main) mutations.observe(main, { childList: true, subtree: true });
    const updateScroll = () => {
      const total = root.scrollHeight - window.innerHeight;
      root.style.setProperty('--page-progress', `${total > 0 ? window.scrollY / total * 100 : 0}%`);
      scrollFrame = 0;
    };
    const onScroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); };
    const resetCard = () => {
      currentCard?.style.removeProperty('--tilt-x');
      currentCard?.style.removeProperty('--tilt-y');
      currentCard = null;
    };
    const drawPointer = () => {
      pointerFrame = 0;
      if (!pointerEvent) return;
      const target = pointerEvent.target instanceof Element ? pointerEvent.target.closest<HTMLElement>('.service-card') : null;
      if (target !== currentCard) resetCard();
      if (!target) return;
      currentCard = target;
      const rect = target.getBoundingClientRect();
      const x = (pointerEvent.clientX - rect.left) / rect.width;
      const y = (pointerEvent.clientY - rect.top) / rect.height;
      target.style.setProperty('--mouse-x', `${x * 100}%`);
      target.style.setProperty('--mouse-y', `${y * 100}%`);
      target.style.setProperty('--tilt-x', `${(0.5 - y) * 4}deg`);
      target.style.setProperty('--tilt-y', `${(x - 0.5) * 5}deg`);
    };
    const onPointer = (event: PointerEvent) => {
      if (reduced.matches || event.pointerType !== 'mouse') return;
      pointerEvent = event;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(drawPointer);
    };
    const onMotionChange = () => {
      if (reduced.matches) {
        document.querySelectorAll<HTMLElement>('.motion-reveal').forEach(element => element.classList.add('in-view'));
        resetCard();
      } else register();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    document.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('pointerleave', resetCard);
    reduced.addEventListener('change', onMotionChange);
    updateScroll();
    return () => {
      observer.disconnect();
      mutations.disconnect();
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(pointerFrame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('pointermove', onPointer);
      document.removeEventListener('pointerleave', resetCard);
      reduced.removeEventListener('change', onMotionChange);
      resetCard();
      document.querySelectorAll('.motion-reveal').forEach(element => element.classList.remove('motion-reveal', 'in-view'));
      root.style.removeProperty('--page-progress');
    };
  }, [pathname]);
  return null;
}
