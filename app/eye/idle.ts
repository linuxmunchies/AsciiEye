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
  snapDelay: number;
  snapOvershoot: number;
  pupilScale: number | null;
  glitch: number;
};

const IDLE_TABLE: IdleSpec[] = [
  {
    id: 'blink',
    className: 'signal-blink',
    weight: 22,
    kind: 'minor',
    min: 130,
    span: 30,
  },
  {
    id: 'saccade',
    className: 'signal-saccade',
    weight: 16,
    kind: 'minor',
    min: 90,
    span: 50,
  },
  {
    id: 'glance',
    className: 'signal-blink signal-saccade',
    weight: 10,
    kind: 'minor',
    min: 150,
    span: 30,
  },
  {
    id: 'churn',
    className: 'signal-churn',
    weight: 8,
    kind: 'minor',
    min: 240,
    span: 160,
  },
  {
    id: 'twitch',
    className: 'signal-twitch',
    weight: 8,
    kind: 'minor',
    min: 90,
    span: 40,
  },
  {
    id: 'doubleBlink',
    className: 'signal-blink-double',
    weight: 6,
    kind: 'minor',
    min: 320,
    span: 40,
  },
  {
    id: 'flicker',
    className: 'signal-flicker',
    weight: 6,
    kind: 'minor',
    min: 110,
    span: 70,
  },
  {
    id: 'compress',
    className: 'signal-compress',
    weight: 6,
    kind: 'minor',
    min: 140,
    span: 50,
  },
  {
    id: 'desync',
    className: 'signal-desync',
    weight: 5,
    kind: 'minor',
    min: 90,
    span: 50,
  },
  {
    id: 'drip',
    className: 'signal-drip',
    weight: 5,
    kind: 'minor',
    min: 260,
    span: 120,
  },
  {
    id: 'wander',
    className: 'signal-wander',
    weight: 5,
    kind: 'medium',
    min: 520,
    span: 280,
  },
  {
    id: 'droop',
    className: 'signal-droop',
    weight: 3,
    kind: 'medium',
    min: 520,
    span: 80,
  },
  {
    id: 'droopAsym',
    className: 'signal-droop-asym',
    weight: 3,
    kind: 'medium',
    min: 480,
    span: 100,
  },
  {
    id: 'loss',
    className: 'signal-loss',
    weight: 3,
    kind: 'medium',
    min: 200,
    span: 140,
  },
  {
    id: 'notice',
    className: 'signal-notice',
    weight: 3,
    kind: 'medium',
    min: 720,
    span: 180,
  },
  {
    id: 'wake',
    className: 'signal-wake signal-churn',
    weight: 2,
    kind: 'medium',
    min: 300,
    span: 160,
  },
  {
    id: 'phantom',
    className: 'signal-phantom',
    weight: 3,
    kind: 'major',
    min: 640,
    span: 260,
  },
  {
    id: 'lock',
    className: 'signal-lock',
    weight: 2,
    kind: 'major',
    min: 520,
    span: 180,
  },
  {
    id: 'stare',
    className: 'signal-stare signal-blink',
    weight: 2,
    kind: 'major',
    min: 480,
    span: 220,
  },
];

const randomGlyph = () =>
  MUTATION_GLYPHS[Math.floor(Math.random() * MUTATION_GLYPHS.length)];

const pickCells = (
  cells: Array<{ row: number; col: number }>,
  count: number,
) => {
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

const phantomGaze = (): Gaze => ({
  x: -(0.22 + Math.random() * 0.28),
  y: (Math.random() < 0.5 ? -1 : 1) * (0.04 + Math.random() * 0.16),
});

export const firstIdleDelay = () => 480 + Math.random() * 900;

export const rollIdle = (
  rows: string[],
  lastGaze: Gaze | null = null,
): IdleRoll => {
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
    snapDelay: 0,
    snapOvershoot: event.kind === 'major' ? 1.14 : 1.08,
    pupilScale: null,
    glitch: 0,
  };

  if (event.id === 'churn' || event.id === 'wake') {
    roll.mutations = pickCells(filled, 18 + Math.floor(Math.random() * 14)).map(
      (cell) => ({
        ...cell,
        char: randomGlyph(),
      }),
    );
  }

  if (event.id === 'flicker') {
    roll.mutations = pickCells(filled, 10 + Math.floor(Math.random() * 8)).map(
      (cell) => ({
        ...cell,
        char: ' ',
      }),
    );
  }

  if (event.id === 'loss') {
    const row0 = 6 + Math.floor(Math.random() * 5);
    const col0 = 18 + Math.floor(Math.random() * 40);
    const next: Mutation[] = [];
    for (let row = row0; row < row0 + 3; row += 1) {
      for (let col = col0; col < col0 + 14; col += 1)
        next.push({ row, col, char: ' ' });
    }
    roll.mutations = next;
  }

  if (event.id === 'desync') {
    roll.desyncRows = [
      6 + Math.floor(Math.random() * 5),
      12 + Math.floor(Math.random() * 4),
    ];
    roll.glitch = 0.55 + Math.random() * 0.4;
  }

  if (event.id === 'saccade' || event.id === 'glance') {
    roll.gazeOffset = {
      x: (Math.random() < 0.5 ? -1 : 1) * (0.05 + Math.random() * 0.07),
      y: (Math.random() < 0.5 ? -1 : 1) * (0.02 + Math.random() * 0.05),
    };
  }

  if (event.id === 'drip') {
    const lower = filled.filter((cell) => cell.row >= 13);
    const seeds = pickCells(
      lower.length > 0 ? lower : filled,
      5 + Math.floor(Math.random() * 4),
    );
    const next: Mutation[] = [];
    for (const cell of seeds) {
      next.push({
        row: cell.row,
        col: cell.col,
        char: Math.random() < 0.5 ? '.' : ':',
      });
      if (cell.row + 1 < EYE_ROWS) {
        next.push({ row: cell.row + 1, col: cell.col, char: '.' });
      }
    }
    roll.mutations = next;
  }

  if (event.id === 'wander') {
    roll.snapTo = {
      x: (Math.random() < 0.5 ? -1 : 1) * (0.12 + Math.random() * 0.22),
      y: (Math.random() < 0.5 ? -1 : 1) * (0.04 + Math.random() * 0.12),
    };
  }

  if (event.id === 'phantom') {
    roll.snapTo = phantomGaze();
  }

  if (event.id === 'lock') {
    if (lastGaze) {
      roll.snapTo = { x: lastGaze.x, y: lastGaze.y };
      roll.pupilScale = 0.9;
    } else {
      roll.className = 'signal-phantom';
      roll.snapTo = phantomGaze();
    }
  }

  if (event.id === 'notice') {
    roll.snapDelay = 380 + Math.random() * 140;
    roll.snapTo = {
      x: (Math.random() < 0.5 ? -1 : 1) * (0.1 + Math.random() * 0.16),
      y: (Math.random() < 0.5 ? -1 : 1) * (0.03 + Math.random() * 0.1),
    };
    roll.snapOvershoot = 1.12;
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
