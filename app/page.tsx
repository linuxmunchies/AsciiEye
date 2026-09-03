'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { Eye } from './eye/Eye';
import {
  applyMutations,
  clampGaze,
  collectFilled,
  EYE_COLS,
  EYE_ROWS,
  MUTATION_GLYPHS,
  rasterEye,
  type Gaze,
  type Mutation,
  type ReformRegion,
} from './eye/raster';

type InterfaceState = 'BOOTING' | 'IDLE' | 'FOCUSED' | 'ARMED' | 'TRANSITIONING';

type Section = {
  id: string;
  label: string;
  href: string;
  color: string;
  gaze: Gaze;
};

const sections: Section[] = [
  { id: 'about', label: 'ABOUT', href: '/about', color: '#00F7FF', gaze: { x: 0, y: -0.36 } },
  { id: 'projects', label: 'PROJECTS', href: '/projects', color: '#39FF94', gaze: { x: 0.58, y: -0.2 } },
  { id: 'blog', label: 'BLOG', href: '/blog', color: '#CFFF4D', gaze: { x: 0.64, y: 0.04 } },
  { id: 'music', label: 'MUSIC', href: '/music', color: '#FF48FF', gaze: { x: 0.48, y: 0.32 } },
  { id: 'greetings', label: 'GREETINGS', href: '/greetings', color: '#A259FF', gaze: { x: -0.58, y: -0.16 } },
  { id: 'photography', label: 'PHOTOGRAPHY', href: '/photography', color: '#4DA2FF', gaze: { x: -0.5, y: 0.32 } },
];

const IDLE_TABLE = [
  { id: 'churn', className: 'signal-churn', weight: 34, kind: 'minor' as const, min: 180, span: 140 },
  { id: 'saccade', className: 'signal-saccade', weight: 22, kind: 'minor' as const, min: 80, span: 60 },
  { id: 'flicker', className: 'signal-flicker', weight: 12, kind: 'minor' as const, min: 120, span: 100 },
  { id: 'desync', className: 'signal-desync', weight: 10, kind: 'minor' as const, min: 55, span: 45 },
  { id: 'compress', className: 'signal-compress', weight: 8, kind: 'medium' as const, min: 220, span: 180 },
  { id: 'loss', className: 'signal-loss', weight: 6, kind: 'medium' as const, min: 120, span: 100 },
  { id: 'slit', className: 'signal-slit', weight: 4, kind: 'medium' as const, min: 500, span: 400 },
  { id: 'wake', className: 'signal-wake', weight: 3, kind: 'medium' as const, min: 280, span: 170 },
  { id: 'stare', className: 'signal-stare', weight: 1, kind: 'major' as const, min: 400, span: 300 },
];

type IdleRoll = {
  className: string;
  kind: 'minor' | 'medium' | 'major';
  duration: number;
  gap: number;
  mutations: Mutation[];
  desyncRows: number[];
  gazeOffset: Gaze;
  reform: ReformRegion | null;
  forcedGaze: Gaze | null;
  pupilScale: number | null;
};

const randomGlyph = () => MUTATION_GLYPHS[Math.floor(Math.random() * MUTATION_GLYPHS.length)];

const pickCells = (cells: Array<{ row: number; col: number }>, count: number) => {
  const pool = cells.slice();
  const chosen: Array<{ row: number; col: number }> = [];
  const take = Math.min(count, pool.length);
  for (let i = 0; i < take; i += 1) {
    const index = Math.floor(Math.random() * pool.length);
    chosen.push(pool.splice(index, 1)[0]);
  }
  return chosen;
};

const pickWeighted = () => {
  const total = IDLE_TABLE.reduce((sum, event) => sum + event.weight, 0);
  let roll = Math.random() * total;
  for (const event of IDLE_TABLE) {
    roll -= event.weight;
    if (roll <= 0) return event;
  }
  return IDLE_TABLE[0];
};

const rollIdle = (rows: string[]): IdleRoll => {
  const event = pickWeighted();
  const filled = collectFilled(rows);
  const duration = event.min + Math.random() * event.span;
  const gap =
    event.kind === 'major'
      ? 10000 + Math.random() * 10000
      : event.kind === 'medium'
        ? 8000 + Math.random() * 10000
        : 2500 + Math.random() * 4500;

  const roll: IdleRoll = {
    className: event.className,
    kind: event.kind,
    duration,
    gap,
    mutations: [],
    desyncRows: [],
    gazeOffset: { x: 0, y: 0 },
    reform: null,
    forcedGaze: null,
    pupilScale: null,
  };

  if (event.id === 'churn') {
    roll.mutations = pickCells(filled, 16 + Math.floor(Math.random() * 12)).map((cell) => ({
      ...cell,
      char: randomGlyph(),
    }));
  } else if (event.id === 'flicker') {
    roll.mutations = pickCells(filled, 8 + Math.floor(Math.random() * 7)).map((cell) => ({ ...cell, char: ' ' }));
  } else if (event.id === 'loss') {
    const row0 = 6 + Math.floor(Math.random() * 5);
    const col0 = 18 + Math.floor(Math.random() * 40);
    const next: Mutation[] = [];
    for (let row = row0; row < row0 + 3; row += 1) {
      for (let col = col0; col < col0 + 14; col += 1) next.push({ row, col, char: ' ' });
    }
    roll.mutations = next;
  } else if (event.id === 'desync') {
    roll.desyncRows = [6 + Math.floor(Math.random() * 5), 12 + Math.floor(Math.random() * 4)];
  } else if (event.id === 'saccade') {
    roll.gazeOffset = {
      x: (Math.random() < 0.5 ? -1 : 1) * (0.04 + Math.random() * 0.05),
      y: (Math.random() < 0.5 ? -1 : 1) * (0.02 + Math.random() * 0.04),
    };
  } else if (event.id === 'wake') {
    const row0 = 4 + Math.floor(Math.random() * 6);
    const col0 = 12 + Math.floor(Math.random() * 40);
    roll.reform = {
      row0,
      row1: Math.min(EYE_ROWS - 2, row0 + 5),
      col0,
      col1: Math.min(EYE_COLS - 2, col0 + 22),
      salt: 20 + Math.random() * 80,
    };
  } else if (event.id === 'stare') {
    roll.forcedGaze = { x: 0, y: 0 };
    roll.pupilScale = 1.12;
  }

  return roll;
};

const firstIdleDelay = () => 2600 + Math.random() * 4200;
const LOOK_BACK_MS = 3200;
const ARMED_LOOK_BACK_MS = 7000;
const BOOT_MS = 1320;

const isOrbitLink = (node: EventTarget | null) =>
  node instanceof Element && Boolean(node.closest('.orbit-link'));

function runSnap(
  from: Gaze,
  target: Gaze,
  pupilScale: number,
  reduced: boolean,
  rafSlot: { current: number },
  apply: (gaze: Gaze) => void,
) {
  const to = clampGaze(target.x, target.y, pupilScale);
  window.cancelAnimationFrame(rafSlot.current);
  if (reduced) {
    apply(to);
    return;
  }

  const started = performance.now();
  const duration = 140;
  const step = (now: number) => {
    const t = Math.min(1, (now - started) / duration);
    let k = t;
    if (t < 0.5) k = (t / 0.5) * 1.06;
    else if (t < 0.72) k = 1.06;
    else k = 1.06 + (1 - 1.06) * ((t - 0.72) / 0.28);
    const next = clampGaze(from.x + (to.x - from.x) * k, from.y + (to.y - from.y) * k, pupilScale);
    apply(next);
    if (t < 1) rafSlot.current = window.requestAnimationFrame(step);
    else apply(to);
  };
  rafSlot.current = window.requestAnimationFrame(step);
}

function runDilate(rafSlot: { current: number }, apply: (scale: number) => void) {
  const started = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - started) / 520);
    apply(1 + t * t * 2.6);
    if (t < 1) rafSlot.current = window.requestAnimationFrame(step);
  };
  rafSlot.current = window.requestAnimationFrame(step);
}

export default function Home() {
  const [interfaceState, setInterfaceState] = useState<InterfaceState>('BOOTING');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [armedId, setArmedId] = useState<string | null>(null);
  const [idleEvent, setIdleEvent] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [gaze, setGaze] = useState<Gaze>({ x: 0, y: 0 });
  const [gazeOffset, setGazeOffset] = useState<Gaze>({ x: 0, y: 0 });
  const [forcedGaze, setForcedGaze] = useState<Gaze | null>(null);
  const [pupilScale, setPupilScale] = useState(1);
  const [mutations, setMutations] = useState<Mutation[]>([]);
  const [reform, setReform] = useState<ReformRegion | null>(null);
  const [desyncRows, setDesyncRows] = useState<number[]>([]);
  const [glitchStrength, setGlitchStrength] = useState(0);
  const [bootId, setBootId] = useState(0);

  const locked = useRef(false);
  const gazeRef = useRef<Gaze>({ x: 0, y: 0 });
  const reducedRef = useRef(false);
  const snapRaf = useRef(0);
  const dilateRaf = useRef(0);
  const idleTimer = useRef<number | undefined>(undefined);
  const eventTimer = useRef<number | undefined>(undefined);
  const lookBackTimer = useRef<number | undefined>(undefined);
  const bootReplayLock = useRef(false);
  const meshRef = useRef<ReturnType<typeof rasterEye>>(rasterEye({ gazeX: 0, gazeY: 0 }));

  const active = sections.find((section) => section.id === activeId);
  const drawnGaze = forcedGaze ?? {
    x: gaze.x + gazeOffset.x,
    y: gaze.y + gazeOffset.y,
  };
  const mesh = useMemo(
    () =>
      applyMutations(
        rasterEye({
          gazeX: drawnGaze.x,
          gazeY: drawnGaze.y,
          pupilScale,
          reform,
        }),
        mutations,
      ),
    [drawnGaze.x, drawnGaze.y, pupilScale, reform, mutations],
  );

  useEffect(() => {
    meshRef.current = mesh;
  }, [mesh]);

  const rootStyle = {
    '--active-accent': active?.color ?? '#C9B77A',
    '--eye-x': `${drawnGaze.x}`,
    '--eye-y': `${drawnGaze.y}`,
    '--eye-open': interfaceState === 'BOOTING' ? '0' : '1',
    '--glitch-strength': `${glitchStrength}`,
    '--pull-x': `${drawnGaze.x * 90}`,
    '--pull-y': `${drawnGaze.y * 36}`,
    '--glow-strength': active ? '1' : '0.45',
  } as CSSProperties;

  const applyGaze = (next: Gaze) => {
    gazeRef.current = next;
    setGaze(next);
  };

  const snapGaze = (target: Gaze) => {
    runSnap(gazeRef.current, target, pupilScale, reducedRef.current, snapRaf, applyGaze);
  };

  const cancelLookBack = () => {
    window.clearTimeout(lookBackTimer.current);
  };

  const scheduleLookBack = (delay: number) => {
    cancelLookBack();
    lookBackTimer.current = window.setTimeout(() => {
      if (locked.current) return;
      setActiveId(null);
      setArmedId(null);
      setGazeOffset({ x: 0, y: 0 });
      setForcedGaze(null);
      setPupilScale(1);
      setInterfaceState((state) => (state === 'BOOTING' || state === 'TRANSITIONING' ? state : 'IDLE'));
      snapGaze({ x: 0, y: 0 });
    }, delay);
  };

  const clearTransient = () => {
    setIdleEvent('');
    setMutations([]);
    setReform(null);
    setDesyncRows([]);
    setGazeOffset({ x: 0, y: 0 });
    setForcedGaze(null);
    setGlitchStrength(0);
  };

  const replayAwakening = () => {
    if (bootReplayLock.current) return;
    bootReplayLock.current = true;
    locked.current = false;
    window.cancelAnimationFrame(snapRaf.current);
    window.cancelAnimationFrame(dilateRaf.current);
    window.clearTimeout(idleTimer.current);
    window.clearTimeout(eventTimer.current);
    cancelLookBack();
    gazeRef.current = { x: 0, y: 0 };
    setGaze({ x: 0, y: 0 });
    setGazeOffset({ x: 0, y: 0 });
    setForcedGaze(null);
    setReform(null);
    setMutations([]);
    setDesyncRows([]);
    setIdleEvent('');
    setGlitchStrength(0);
    setPupilScale(1);
    setActiveId(null);
    setArmedId(null);
    setBootId((id) => id + 1);
    setInterfaceState('BOOTING');
    window.setTimeout(() => {
      bootReplayLock.current = false;
    }, 80);
  };

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      reducedRef.current = query.matches;
      setReducedMotion(query.matches);
    };
    updatePreference();
    query.addEventListener('change', updatePreference);

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted || locked.current) replayAwakening();
    };
    const onPopState = () => {
      if (locked.current) replayAwakening();
    };

    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('popstate', onPopState);

    return () => {
      window.clearTimeout(idleTimer.current);
      window.clearTimeout(eventTimer.current);
      cancelLookBack();
      query.removeEventListener('change', updatePreference);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  useEffect(() => {
    const delay = reducedRef.current ? 0 : BOOT_MS;
    const bootTimer = window.setTimeout(
      () => setInterfaceState((state) => (state === 'BOOTING' ? 'IDLE' : state)),
      delay,
    );
    return () => window.clearTimeout(bootTimer);
  }, [bootId]);

  useEffect(() => {
    if (reducedMotion || interfaceState !== 'IDLE') {
      window.clearTimeout(idleTimer.current);
      window.clearTimeout(eventTimer.current);
      return;
    }

    const schedule = (delay: number) => {
      idleTimer.current = window.setTimeout(() => {
        if (locked.current) return;
        const roll = rollIdle(meshRef.current.rows);
        clearTransient();
        setIdleEvent(roll.className);
        setMutations(roll.mutations);
        setDesyncRows(roll.desyncRows);
        setGazeOffset(roll.gazeOffset);
        setReform(roll.reform);
        setForcedGaze(roll.forcedGaze);
        if (roll.pupilScale !== null) setPupilScale(roll.pupilScale);

        eventTimer.current = window.setTimeout(() => {
          clearTransient();
          if (roll.pupilScale !== null) setPupilScale(1);
          schedule(roll.gap);
        }, roll.duration);
      }, delay);
    };

    schedule(firstIdleDelay());
    return () => {
      window.clearTimeout(idleTimer.current);
      window.clearTimeout(eventTimer.current);
    };
  }, [reducedMotion, interfaceState]);

  const activate = (id: string, arm = false) => {
    if (locked.current) return;
    const section = sections.find((item) => item.id === id);
    if (!section) return;
    const changed = activeId !== id;
    cancelLookBack();
    setActiveId(id);
    setArmedId(arm ? id : null);
    setInterfaceState(arm ? 'ARMED' : 'FOCUSED');
    window.clearTimeout(idleTimer.current);
    window.clearTimeout(eventTimer.current);
    setGazeOffset({ x: 0, y: 0 });
    setForcedGaze(null);
    setReform(null);
    if (interfaceState !== 'TRANSITIONING') setPupilScale(1);
    if (changed) {
      setIdleEvent('');
      setDesyncRows([]);
      setMutations([]);
      setGlitchStrength(0);
      snapGaze(section.gaze);
    }
    if (arm) scheduleLookBack(ARMED_LOOK_BACK_MS);
  };

  const clearFocus = () => {
    if (locked.current || armedId) return;
    setActiveId(null);
    setInterfaceState('IDLE');
    scheduleLookBack(LOOK_BACK_MS);
  };

  const beginTransition = (section: Section) => {
    if (locked.current) return;
    locked.current = true;
    window.clearTimeout(idleTimer.current);
    window.clearTimeout(eventTimer.current);
    window.cancelAnimationFrame(snapRaf.current);
    cancelLookBack();
    clearTransient();
    setActiveId(section.id);
    setArmedId(null);
    setInterfaceState('TRANSITIONING');
    snapGaze(section.gaze);

    if (!reducedRef.current) runDilate(dilateRaf, setPupilScale);

    window.setTimeout(() => window.location.assign(section.href), reducedRef.current ? 70 : 740);
  };

  const dismissSelection = () => {
    if (locked.current) return;
    if (!activeId && !armedId) return;
    setActiveId(null);
    setArmedId(null);
    setInterfaceState('IDLE');
    scheduleLookBack(LOOK_BACK_MS);
  };

  const hasFinePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, section: Section) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

    if (event.detail === 0) {
      event.preventDefault();
      activate(section.id);
      beginTransition(section);
      return;
    }

    if (!hasFinePointer()) {
      event.preventDefault();
      if (armedId !== section.id) {
        activate(section.id, true);
        return;
      }
      beginTransition(section);
      return;
    }

    event.preventDefault();
    activate(section.id);
    beginTransition(section);
  };

  const className = [
    'signal-site',
    interfaceState === 'BOOTING' && 'is-booting',
    interfaceState === 'TRANSITIONING' && 'is-transitioning',
    interfaceState === 'FOCUSED' && 'is-focused',
    interfaceState === 'ARMED' && 'is-armed',
    active && 'has-active',
    idleEvent,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <main
      className={className}
      style={rootStyle}
      key={bootId}
      onPointerDown={(event) => {
        if ((event.target as Element | null)?.closest('.orbit-link')) return;
        dismissSelection();
      }}
    >
      <div className="field-grain" aria-hidden="true" />
      <div className="faint-axis faint-axis--horizontal" aria-hidden="true" />
      <div className="faint-axis faint-axis--vertical" aria-hidden="true" />
      <div className="awakening-line" aria-hidden="true" />
      <div className="awakening-split awakening-split--up" aria-hidden="true" />
      <div className="awakening-split awakening-split--down" aria-hidden="true" />
      <div className="awakening-burst" aria-hidden="true" />
      <div className="awakening-scan" aria-hidden="true" />
      <div className="blackout" aria-hidden="true" />
      <div className="convergence" aria-hidden="true" />

      <h1 className="sr-only">Personal site navigation</h1>
      <section className="eye-stage" aria-label="Reactive terminal eye">
        <Eye rows={mesh.rows} irisRows={mesh.irisRows} desyncRows={desyncRows} />
      </section>

      <nav className="orbital-nav" aria-label="Primary navigation">
        {sections.map((section) => {
          const selected = activeId === section.id;
          const armed = armedId === section.id;
          return (
            <a
              className={`orbit-link orbit-link--${section.id}${selected ? ' is-active' : ''}`}
              href={section.href}
              key={section.id}
              onMouseEnter={() => hasFinePointer() && activate(section.id)}
              onMouseLeave={(event) => {
                if (isOrbitLink(event.relatedTarget)) return;
                clearFocus();
              }}
              onFocus={() => activate(section.id)}
              onBlur={(event) => {
                if (isOrbitLink(event.relatedTarget)) return;
                clearFocus();
              }}
              onClick={(event) => handleClick(event, section)}
              style={{ '--link-accent': section.color } as CSSProperties}
            >
              <span className="link-marker" aria-hidden="true">
                &gt;
              </span>
              <span>{section.label}</span>
              <span className="link-fragment" aria-hidden="true">
                ::
              </span>
              {armed && (
                <span className="armed-note" aria-hidden="true">
                  [ TAP AGAIN ]
                </span>
              )}
              {armed && <span className="sr-only">{section.label} selected. Tap again to enter.</span>}
            </a>
          );
        })}
      </nav>
    </main>
  );
}
