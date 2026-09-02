'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent, TouchEvent } from 'react';

type InterfaceState = 'BOOTING' | 'IDLE' | 'FOCUSED' | 'ARMED' | 'TRANSITIONING';

type Section = {
  id: string;
  label: string;
  href: string;
  color: string;
  gaze: { x: number; y: number };
};

const sections: Section[] = [
  { id: 'about', label: 'ABOUT', href: '/about/', color: '#00F7FF', gaze: { x: 0, y: -9 } },
  { id: 'projects', label: 'PROJECTS', href: '/projects/', color: '#39FF94', gaze: { x: 17, y: -6 } },
  { id: 'blog', label: 'BLOG', href: '/blog/', color: '#CFFF4D', gaze: { x: 21, y: 2 } },
  { id: 'music', label: 'MUSIC', href: '/music/', color: '#FF48FF', gaze: { x: 14, y: 11 } },
  { id: 'greetings', label: 'GREETINGS', href: '/greetings/', color: '#A259FF', gaze: { x: -18, y: -4 } },
  { id: 'photography', label: 'PHOTOGRAPHY', href: '/photography/', color: '#4DA2FF', gaze: { x: -15, y: 11 } },
];

const glyphRows = [
  { content: '. :  |  -  +  <  >  0 1', y: 94, width: 91, opacity: 0.32 },
  { content: '..  -  .  +  >  :  0  |  -', y: 138, width: 95, opacity: 0.65 },
  { content: '< : .  --  |  0 1  +  . : >', y: 182, width: 97, opacity: 0.88 },
  { content: '. 1  | :  >>>  -  +  0 .  |', y: 226, width: 94, opacity: 0.73 },
  { content: '-  .  <  0  |  :  ++  .  1 -', y: 270, width: 91, opacity: 0.4 },
];

function SignalEye() {
  return (
    <svg className="signal-eye" viewBox="0 0 720 360" role="img" aria-label="An abstract eye formed from broken terminal glyphs">
      <defs>
        <clipPath id="eye-window">
          <path d="M70 180C158 62 300 42 360 49c76-8 213 20 290 131-80 114-205 135-290 130-82 4-214-19-290-130Z" />
        </clipPath>
        <filter id="signal-glow" x="-25%" y="-35%" width="150%" height="170%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="signal-fade" x1="0" x2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.17" stopColor="currentColor" stopOpacity="0.86" />
          <stop offset="0.82" stopColor="currentColor" stopOpacity="0.86" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g className="eye-body" filter="url(#signal-glow)">
        <path className="eye-outline eye-outline--upper" d="M70 180C158 62 300 42 360 49c76-8 213 20 290 131" />
        <path className="eye-outline eye-outline--lower" d="M70 180c76 111 208 134 290 130 85 5 210-16 290-130" />
        <path className="eye-trace" d="M99 181c80-81 164-99 258-96 101-3 183 17 265 96" />
        <path className="eye-trace eye-trace--low" d="M99 181c80 81 164 99 258 96 101 3 183-17 265-96" />
        <g clipPath="url(#eye-window)" className="glyph-field">
          {glyphRows.map((row) => (
            <text className="glyph-row" key={row.y} x="360" y={row.y} textAnchor="middle" opacity={row.opacity} textLength={row.width * 5.3} lengthAdjust="spacingAndGlyphs">{row.content}</text>
          ))}
          <text className="glyph-row glyph-row--fracture" x="159" y="159">| . : | --</text>
          <text className="glyph-row glyph-row--fracture" x="438" y="218">++ : 0 &gt; . |</text>
        </g>
        <path className="eye-scanline" d="M122 180H598" />
      </g>

      <g className="pupil-wrap">
        <ellipse className="iris-haze" cx="360" cy="180" rx="76" ry="71" />
        <ellipse className="iris-ring iris-ring--one" cx="360" cy="180" rx="58" ry="59" />
        <ellipse className="iris-ring iris-ring--two" cx="360" cy="180" rx="43" ry="44" />
        <ellipse className="pupil" cx="360" cy="180" rx="29" ry="34" />
        <text className="pupil-glyph" x="360" y="186" textAnchor="middle">0</text>
        <text className="iris-fragment iris-fragment--top" x="360" y="139" textAnchor="middle">:  |  +</text>
        <text className="iris-fragment iris-fragment--bottom" x="360" y="226" textAnchor="middle">-  .  &lt;</text>
      </g>

      <g className="eye-hanging" aria-hidden="true">
        <path d="M138 209v36m19-20v47m396-63v40m-18-24v59" />
        <text x="129" y="260">.</text><text x="149" y="283">1</text>
        <text x="544" y="267">:</text><text x="530" y="300">|</text>
      </g>
    </svg>
  );
}

export default function Home() {
  const [interfaceState, setInterfaceState] = useState<InterfaceState>('BOOTING');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [armedId, setArmedId] = useState<string | null>(null);
  const [idleEvent, setIdleEvent] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);
  const locked = useRef(false);
  const idleTimer = useRef<number | undefined>(undefined);
  const active = sections.find((section) => section.id === activeId);
  const rootStyle = {
    '--active-accent': active?.color ?? '#C9B77A',
    '--eye-x': `${active?.gaze.x ?? 0}px`,
    '--eye-y': `${active?.gaze.y ?? 0}px`,
  } as CSSProperties;

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    const bootTimer = window.setTimeout(() => setInterfaceState('IDLE'), query.matches ? 0 : 1050);
    return () => { window.clearTimeout(bootTimer); query.removeEventListener('change', update); };
  }, []);

  useEffect(() => {
    if (reducedMotion || interfaceState === 'TRANSITIONING') return;
    const events = ['signal-micro', 'signal-twitch', 'signal-blink', 'signal-stare'];
    const schedule = () => {
      idleTimer.current = window.setTimeout(() => {
        if (locked.current) return;
        const next = events[Math.floor(Math.random() * events.length)];
        setIdleEvent(next);
        window.setTimeout(() => setIdleEvent(''), next === 'signal-stare' ? 220 : 105);
        schedule();
      }, 3500 + Math.random() * 7000);
    };
    schedule();
    return () => window.clearTimeout(idleTimer.current);
  }, [reducedMotion, interfaceState]);

  const activate = (id: string, arm = false) => {
    if (locked.current) return;
    setActiveId(id);
    setArmedId(arm ? id : null);
    setInterfaceState(arm ? 'ARMED' : 'FOCUSED');
  };
  const leave = () => {
    if (locked.current || armedId) return;
    setActiveId(null);
    setInterfaceState('IDLE');
  };
  const beginTransition = (href: string) => {
    if (locked.current) return;
    locked.current = true;
    window.clearTimeout(idleTimer.current);
    setInterfaceState('TRANSITIONING');
    window.setTimeout(() => window.location.assign(href), reducedMotion ? 90 : 720);
  };
  const isFinePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const handleClick = (event: MouseEvent<HTMLAnchorElement>, section: Section) => {
    if (!isFinePointer()) {
      if (armedId !== section.id) { event.preventDefault(); activate(section.id, true); return; }
      event.preventDefault(); beginTransition(section.href); return;
    }
    event.preventDefault(); activate(section.id); beginTransition(section.href);
  };
  const handleTouchStart = (event: TouchEvent<HTMLAnchorElement>, section: Section) => {
    if (!isFinePointer() && armedId !== section.id) event.preventDefault();
  };

  return (
    <main className={`signal-site ${interfaceState === 'BOOTING' ? 'is-booting' : ''} ${interfaceState === 'TRANSITIONING' ? 'is-transitioning' : ''} ${active ? 'has-active' : ''} ${armedId ? 'is-armed' : ''} ${idleEvent}`} style={rootStyle}>
      <div className="background-noise" aria-hidden="true" />
      <div className="boot-line" aria-hidden="true" />
      <div className="void-veil" aria-hidden="true" />
      <h1 className="sr-only">Personal site navigation</h1>
      <section className="eye-stage" aria-label="Signal interface"><SignalEye /></section>
      <nav className="orbital-nav" aria-label="Primary navigation">
        {sections.map((section) => (
          <a className={`orbit-link orbit-link--${section.id} ${activeId === section.id ? 'is-active' : ''}`} href={section.href} key={section.id}
            onMouseEnter={() => isFinePointer() && activate(section.id)} onMouseLeave={leave} onFocus={() => activate(section.id)} onBlur={leave}
            onTouchStart={(event) => handleTouchStart(event, section)} onClick={(event) => handleClick(event, section)} style={{ '--link-accent': section.color } as CSSProperties}>
            <span aria-hidden="true" className="link-marker">&gt;</span><span>{section.label}</span><span aria-hidden="true" className="link-fragment">::</span>
          </a>
        ))}
      </nav>
      <div className="collapse-streaks" aria-hidden="true" />
    </main>
  );
}
