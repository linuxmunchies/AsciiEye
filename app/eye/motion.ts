import { clampGaze, type Gaze } from './raster';

export function runSnap(
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

export function runDilate(rafSlot: { current: number }, apply: (scale: number) => void) {
  const started = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - started) / 520);
    apply(1 + t * t * 2.6);
    if (t < 1) rafSlot.current = window.requestAnimationFrame(step);
  };
  rafSlot.current = window.requestAnimationFrame(step);
}
