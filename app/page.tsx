'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { Eye } from './eye/Eye';
import { firstIdleDelay, rollIdle } from './eye/idle';
import { runDilate, runSnap } from './eye/motion';
import { sections, type Section } from './eye/sections';
import {
  applyMutations,
  rasterEye,
  type Gaze,
  type Mutation,
  type ReformRegion,
} from './eye/raster';

type InterfaceState = 'BOOTING' | 'IDLE' | 'FOCUSED' | 'ARMED' | 'TRANSITIONING';

const LOOK_BACK_MS = 3200;
const ARMED_LOOK_BACK_MS = 7000;
const BOOT_MS = 1500;

const isOrbitLink = (node: EventTarget | null) =>
  node instanceof Element && Boolean(node.closest('.orbit-link'));

export default function Home() {
  const [interfaceState, setInterfaceState] =
    useState<InterfaceState>('BOOTING');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [armedId, setArmedId] = useState<string | null>(null);
  const [idleEvent, setIdleEvent] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [gaze, setGaze] = useState<Gaze>({ x: 0, y: 0 });
  const [gazeOffset, setGazeOffset] = useState<Gaze>({ x: 0, y: 0 });
  const [pupilScale, setPupilScale] = useState(1);
  const [mutations, setMutations] = useState<Mutation[]>([]);
  const [reform, setReform] = useState<ReformRegion | null>(null);
  const [desyncRows, setDesyncRows] = useState<number[]>([]);
  const [glitchStrength, setGlitchStrength] = useState(0);
  const [bootId, setBootId] = useState(0);

  const locked = useRef(false);
  const stateRef = useRef(interfaceState);
  const activeRef = useRef(activeId);
  const armedRef = useRef(armedId);
  const gazeRef = useRef<Gaze>({ x: 0, y: 0 });
  const reducedRef = useRef(false);
  const snapRaf = useRef(0);
  const dilateRaf = useRef(0);
  const idleTimer = useRef<number | undefined>(undefined);
  const eventTimer = useRef<number | undefined>(undefined);
  const lookBackTimer = useRef<number | undefined>(undefined);
  const navTimer = useRef<number | undefined>(undefined);
  const glitchTimer = useRef<number | undefined>(undefined);
  const bootReplayLock = useRef(false);
  const meshRef = useRef<ReturnType<typeof rasterEye>>(
    rasterEye({ gazeX: 0, gazeY: 0 }),
  );

  const active = sections.find((section) => section.id === activeId);
  const drawnGaze = {
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
    runSnap(
      gazeRef.current,
      target,
      pupilScale,
      reducedRef.current,
      snapRaf,
      applyGaze,
    );
  };

  const cancelLookBack = () => {
    window.clearTimeout(lookBackTimer.current);
  };

  const inputLocked = () => locked.current || interfaceState === 'BOOTING';

  const pulseGlitch = () => {
    window.clearTimeout(glitchTimer.current);
    setGlitchStrength(0.85);
    glitchTimer.current = window.setTimeout(() => setGlitchStrength(0), 90);
  };

  const scheduleLookBack = (delay: number) => {
    cancelLookBack();
    lookBackTimer.current = window.setTimeout(() => {
      if (locked.current) return;
      setActiveId(null);
      setArmedId(null);
      setGazeOffset({ x: 0, y: 0 });
      setPupilScale(1);
      setInterfaceState((state) =>
        state === 'BOOTING' || state === 'TRANSITIONING' ? state : 'IDLE',
      );
      snapGaze({ x: 0, y: 0 });
    }, delay);
  };

  const clearTransient = () => {
    setIdleEvent('');
    setMutations([]);
    setReform(null);
    setDesyncRows([]);
    setGazeOffset({ x: 0, y: 0 });
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
    window.clearTimeout(navTimer.current);
    window.clearTimeout(glitchTimer.current);
    cancelLookBack();
    gazeRef.current = { x: 0, y: 0 };
    setGaze({ x: 0, y: 0 });
    setGazeOffset({ x: 0, y: 0 });
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
    stateRef.current = interfaceState;
    activeRef.current = activeId;
    armedRef.current = armedId;
  }, [interfaceState, activeId, armedId]);

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
    const onPageHide = () => {
      if (locked.current)
        document
          .querySelector('.signal-site')
          ?.classList.remove('is-transitioning');
    };
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('popstate', onPopState);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.clearTimeout(idleTimer.current);
      window.clearTimeout(eventTimer.current);
      window.clearTimeout(navTimer.current);
      window.clearTimeout(glitchTimer.current);
      cancelLookBack();
      query.removeEventListener('change', updatePreference);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (
        stateRef.current === 'TRANSITIONING' ||
        stateRef.current === 'BOOTING'
      )
        return;
      if (!activeRef.current && !armedRef.current) return;
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
      setActiveId(null);
      setArmedId(null);
      scheduleLookBack(LOOK_BACK_MS);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  useEffect(() => {
    const delay = reducedRef.current ? 0 : BOOT_MS;
    const bootTimer = window.setTimeout(
      () =>
        setInterfaceState((state) => (state === 'BOOTING' ? 'IDLE' : state)),
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
        if (roll.glitch) setGlitchStrength(roll.glitch);
        setGazeOffset(roll.gazeOffset);
        setReform(roll.reform);
        if (roll.pupilScale !== null) setPupilScale(roll.pupilScale);
        if (roll.snapTo) {
          runSnap(gazeRef.current, roll.snapTo, 1, reducedRef.current, snapRaf, (next) => {
            gazeRef.current = next;
            setGaze(next);
          });
        }

        eventTimer.current = window.setTimeout(() => {
          if (locked.current) return;
          clearTransient();
          if (roll.pupilScale !== null) setPupilScale(1);
          if (roll.snapTo && stateRef.current === 'IDLE') {
            runSnap(gazeRef.current, { x: 0, y: 0 }, 1, reducedRef.current, snapRaf, (next) => {
              gazeRef.current = next;
              setGaze(next);
            });
          }
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
    if (inputLocked()) return;
    const section = sections.find((item) => item.id === id);
    if (!section) return;
    const changed = activeId !== id;
    cancelLookBack();
    setActiveId(id);
    setArmedId(arm || armedId === id ? id : null);
    setInterfaceState(arm || armedId === id ? 'ARMED' : 'FOCUSED');
    window.clearTimeout(idleTimer.current);
    window.clearTimeout(eventTimer.current);
    setGazeOffset({ x: 0, y: 0 });
    setReform(null);
    if (interfaceState !== 'TRANSITIONING') setPupilScale(1);
    if (changed) {
      setIdleEvent('');
      setDesyncRows([]);
      setMutations([]);
      pulseGlitch();
      snapGaze(section.gaze);
    }
    if (arm) scheduleLookBack(ARMED_LOOK_BACK_MS);
  };

  const clearFocus = () => {
    if (inputLocked() || armedId) return;
    setActiveId(null);
    scheduleLookBack(LOOK_BACK_MS);
  };

  const beginTransition = (section: Section) => {
    if (inputLocked()) return;
    locked.current = true;
    window.clearTimeout(idleTimer.current);
    window.clearTimeout(eventTimer.current);
    window.clearTimeout(navTimer.current);
    window.cancelAnimationFrame(snapRaf.current);
    cancelLookBack();
    clearTransient();
    setActiveId(section.id);
    setArmedId(null);
    setInterfaceState('TRANSITIONING');
    snapGaze(section.gaze);

    if (!reducedRef.current) runDilate(dilateRaf, setPupilScale);

    navTimer.current = window.setTimeout(
      () => window.location.assign(section.href),
      reducedRef.current ? 70 : 810,
    );
  };

  const dismissSelection = () => {
    if (inputLocked()) return;
    if (!activeId && !armedId) return;
    setActiveId(null);
    setArmedId(null);
    scheduleLookBack(LOOK_BACK_MS);
  };

  const hasFinePointer = () =>
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const handleClick = (
    event: MouseEvent<HTMLAnchorElement>,
    section: Section,
  ) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    )
      return;

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

  const statusText =
    interfaceState === 'TRANSITIONING' && active
      ? `Entering ${active.label}.`
      : armedId
        ? `${sections.find((section) => section.id === armedId)?.label ?? ''} selected. Activate again to enter.`
        : '';

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
      <div
        className="awakening-split awakening-split--down"
        aria-hidden="true"
      />
      <div className="awakening-burst" aria-hidden="true" />
      <div className="awakening-scan" aria-hidden="true" />
      <div className="blackout" aria-hidden="true" />
      <div className="convergence" aria-hidden="true" />

      <h1 className="sr-only">Personal site navigation</h1>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusText}
      </div>
      <section className="eye-stage" aria-hidden="true">
        <Eye
          rows={mesh.rows}
          irisRows={mesh.irisRows}
          desyncRows={desyncRows}
        />
      </section>

      <nav
        className="orbital-nav"
        aria-label="Primary navigation"
        inert={
          interfaceState === 'BOOTING' || interfaceState === 'TRANSITIONING'
            ? true
            : undefined
        }
      >
        {sections.map((section) => {
          const selected = activeId === section.id;
          const armed = armedId === section.id;
          return (
            <a
              className={`orbit-link orbit-link--${section.id}${selected ? ' is-active' : ''}`}
              href={section.href}
              key={section.id}
              aria-current={selected ? 'true' : undefined}
              aria-label={
                armed
                  ? `${section.label}, selected, activate again to enter`
                  : undefined
              }
              onMouseEnter={() => hasFinePointer() && activate(section.id)}
              onMouseLeave={(event) => {
                if (isOrbitLink(event.relatedTarget)) return;
                if (event.currentTarget === document.activeElement) return;
                clearFocus();
              }}
              onFocus={() => activate(section.id, armedId === section.id)}
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
            </a>
          );
        })}
      </nav>
    </main>
  );
}
