import {
  collectFilled,
  EYE_COLS,
  EYE_ROWS,
  MUTATION_GLYPHS,
  type Gaze,
  type Mutation,
  type ReformRegion,
} from './raster';

type IdleKind = 'minor' | 'medium' | 'major';

type IdleSpec = {
  id: string;
  className: string;
  weight: number;
  kind: IdleKind;
  min: number;
  span: number;
};

export type IdleRoll = {
  className: string;
  kind: IdleKind;
  duration: number;
  gap: number;
  mutations: Mutation[];
  desyncRows: number[];
  gazeOffset: Gaze;
  reform: ReformRegion | null;
  snapTo: Gaze | null;
  pupilScale: number | null;
  glitch: number;
};

const IDLE_TABLE: IdleSpec[] = [
  { id: 'blink', className: 'signal-blink', weight: 30, kind: 'minor', min: 130, span: 30 },
  { id: 'saccade', className: 'signal-saccade', weight: 20, kind: 'minor', min: 90, span: 50 },
  { id: 'glance', className: 'signal-blink signal-saccade', weight: 12, kind: 'minor', min: 150, span: 30 },
  { id: 'churn', className: 'signal-churn', weight: 10, kind: 'minor', min: 240, span: 160 },
  { id: 'doubleBlink', className: 'signal-blink-double', weight: 8, kind: 'minor', min: 320, span: 40 },
  { id: 'flicker', className: 'signal-flicker', weight: 7, kind: 'minor', min: 110, span: 70 },
  { id: 'desync', className: 'signal-desync', weight: 6, kind: 'minor', min: 90, span: 50 },
  { id: 'wander', className: 'signal-wander', weight: 6, kind: 'medium', min: 520, span: 280 },
  { id: 'droop', className: 'signal-droop', weight: 4, kind: 'medium', min: 520, span: 80 },
  { id: 'loss', className: 'signal-loss', weight: 4, kind: 'medium', min: 200, span: 140 },
  { id: 'wake', className: 'signal-wake signal-churn', weight: 3, kind: 'medium', min: 300, span: 160 },
  { id: 'stare', className: 'signal-stare signal-blink', weight: 2, kind: 'major', min: 480, span: 220 },
];

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

const gapFor = (kind: IdleKind) => {
  if (kind === 'major') return 1600 + Math.random() * 1800;
  if (kind === 'medium') return 700 + Math.random() * 1100;
  return 380 + Math.random() * 900;
};

export const firstIdleDelay = () => 480 + Math.random() * 900;

export const rollIdle = (rows: string[]): IdleRoll => {
  const event = pickWeighted();
  const filled = collectFilled(rows);
  const roll: IdleRoll = {
    className: event.className,
    kind: event.kind,
    duration: event.min + Math.random() * event.span,
    gap: gapFor(event.kind),
    mutations: [],
    desyncRows: [],
    gazeOffset: { x: 0, y: 0 },
    reform: null,
    snapTo: null,
    pupilScale: null,
    glitch: 0,
  };

  if (event.id === 'churn' || event.id === 'wake') {
    roll.mutations = pickCells(filled, 18 + Math.floor(Math.random() * 14)).map((cell) => ({
      ...cell,
      char: randomGlyph(),
    }));
  }

  if (event.id === 'flicker') {
    roll.mutations = pickCells(filled, 10 + Math.floor(Math.random() * 8)).map((cell) => ({
      ...cell,
      char: ' ',
    }));
  }

  if (event.id === 'loss') {
    const row0 = 6 + Math.floor(Math.random() * 5);
    const col0 = 18 + Math.floor(Math.random() * 40);
    const next: Mutation[] = [];
    for (let row = row0; row < row0 + 3; row += 1) {
      for (let col = col0; col < col0 + 14; col += 1) next.push({ row, col, char: ' ' });
    }
    roll.mutations = next;
  }

  if (event.id === 'desync') {
    roll.desyncRows = [6 + Math.floor(Math.random() * 5), 12 + Math.floor(Math.random() * 4)];
    roll.glitch = 0.55 + Math.random() * 0.4;
  }

  if (event.id === 'saccade' || event.id === 'glance') {
    roll.gazeOffset = {
      x: (Math.random() < 0.5 ? -1 : 1) * (0.05 + Math.random() * 0.07),
      y: (Math.random() < 0.5 ? -1 : 1) * (0.02 + Math.random() * 0.05),
    };
  }

  if (event.id === 'wander') {
    roll.snapTo = {
      x: (Math.random() < 0.5 ? -1 : 1) * (0.12 + Math.random() * 0.22),
      y: (Math.random() < 0.5 ? -1 : 1) * (0.04 + Math.random() * 0.12),
    };
  }

  if (event.id === 'wake') {
    const row0 = 4 + Math.floor(Math.random() * 6);
    const col0 = 12 + Math.floor(Math.random() * 40);
    roll.reform = {
      row0,
      row1: Math.min(EYE_ROWS - 2, row0 + 5),
      col0,
      col1: Math.min(EYE_COLS - 2, col0 + 22),
      salt: 20 + Math.random() * 80,
    };
  }

  if (event.id === 'stare') {
    roll.snapTo = { x: 0, y: 0 };
    roll.pupilScale = 1.14;
  }

  return roll;
};
