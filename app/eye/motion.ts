import { clampGaze, type Gaze } from './raster';

export function runSnap(
  from: Gaze,
  target: Gaze,
  pupilScale: number,
  reduced: boolean,
  rafSlot: { current: number },
  apply: (gaze: Gaze) => void,
  overshoot = 1.16,
) {
  const to = clampGaze(target.x, target.y, pupilScale);
  window.cancelAnimationFrame(rafSlot.current);
  if (reduced) {
    apply(to);
    return;
  }

  const started = performance.now();
  const duration = 160;
  const peak = Math.max(1, overshoot);
  const step = (now: number) => {
    const t = Math.min(1, (now - started) / duration);
    let k = t;
    if (peak > 1) {
      if (t < 0.45) k = (t / 0.45) * peak;
      else if (t < 0.64) k = peak;
      else k = peak + (1 - peak) * ((t - 0.64) / 0.36);
    }
    const next = clampGaze(
      from.x + (to.x - from.x) * k,
      from.y + (to.y - from.y) * k,
      pupilScale,
    );
    apply(next);
    if (t < 1) rafSlot.current = window.requestAnimationFrame(step);
    else apply(to);
  };
  rafSlot.current = window.requestAnimationFrame(step);
}

export function runDilate(
  rafSlot: { current: number },
  apply: (scale: number) => void,
  from = 1,
) {
  const started = performance.now();
  const start = from;
  const end = 3.6;
  const step = (now: number) => {
    const t = Math.min(1, (now - started) / 520);
    apply(start + (end - start) * t * t);
    if (t < 1) rafSlot.current = window.requestAnimationFrame(step);
  };
  rafSlot.current = window.requestAnimationFrame(step);
}
