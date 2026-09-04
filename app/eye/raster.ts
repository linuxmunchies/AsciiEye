export const EYE_COLS = 97;
export const EYE_ROWS = 21;

export const FIELD_GLYPHS = ['.', '.', ':', ':', '|', '|', '-', '+', '+', '<', '>', '0', '1'] as const;
export const EDGE_GLYPHS = [':', '|', '-', '+', '<', '>', '1'] as const;
export const IRIS_GLYPHS = ['0', '1', '|', ':', '+'] as const;
export const MUTATION_GLYPHS = ['.', ':', '|', '-', '+', '<', '>', '0', '1'] as const;

export type Gaze = { x: number; y: number };

export type ReformRegion = {
  row0: number;
  row1: number;
  col0: number;
  col1: number;
  salt: number;
};

export type Mutation = {
  row: number;
  col: number;
  char: string;
};

export type RasterInput = {
  gazeX: number;
  gazeY: number;
  pupilScale?: number;
  reform?: ReformRegion | null;
};

export type RasterMesh = {
  rows: string[];
  irisRows: string[];
};

const PUPIL_RX = 0.18;
const PUPIL_RY = 0.42;
const IRIS_RX = 0.36;
const IRIS_RY = 0.76;

function hash(x: number, y: number, salt = 0) {
  const value = Math.sin((x + 3.1) * 12.9898 + (y + 7.7) * 78.233 + salt * 37.719) * 43758.5453;
  return value - Math.floor(value);
}

function almondHalf(x: number) {
  return 0.7 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x), 1.42)), 0.54);
}

function pick(glyphs: readonly string[], noise: number) {
  return glyphs[Math.floor(noise * glyphs.length)];
}

export function clampGaze(x: number, y: number, pupilScale = 1): Gaze {
  const scale = Math.min(pupilScale, 1.15);
  const pRx = PUPIL_RX * scale;
  const pRy = PUPIL_RY * scale;
  const gx = Math.max(-0.58, Math.min(0.58, x));
  const almond = Math.min(almondHalf(gx), almondHalf(gx - pRx), almondHalf(gx + pRx));
  const maxY = Math.max(0.02, almond - pRy * 0.55);
  return { x: gx, y: Math.max(-maxY, Math.min(maxY, y)) };
}

export function rasterEye({
  gazeX,
  gazeY,
  pupilScale = 1,
  reform = null,
}: RasterInput): RasterMesh {
  const gaze = clampGaze(gazeX, gazeY, pupilScale);
  const pRx = PUPIL_RX * pupilScale;
  const pRy = PUPIL_RY * pupilScale;
  const iRx = IRIS_RX * Math.min(pupilScale, 1.4);
  const iRy = IRIS_RY * Math.min(pupilScale, 1.4);
  const rows: string[] = [];
  const irisRows: string[] = [];

  for (let row = 0; row < EYE_ROWS; row += 1) {
    const y = ((row / (EYE_ROWS - 1)) * 2 - 1) * 0.96;
    let line = '';
    let irisLine = '';

    for (let col = 0; col < EYE_COLS; col += 1) {
      const x = (col / (EYE_COLS - 1)) * 2 - 1;
      const reforming = Boolean(
        reform &&
          row >= reform.row0 &&
          row <= reform.row1 &&
          col >= reform.col0 &&
          col <= reform.col1,
      );
      const salt = reforming && reform ? reform.salt : 0;
      const noise = (s = 0) => hash(col, row, s + salt);
      const half = almondHalf(x);
      const yAdj = y - x * 0.025;
      const inside = Math.abs(yAdj) <= half;
      const drip =
        yAdj > half && yAdj < half + 0.14 && noise(11) < 0.08 && Math.abs(x) < 0.8;

      if (!inside && !drip) {
        line += ' ';
        irisLine += ' ';
        continue;
      }

      const pupilDist = Math.hypot((x - gaze.x) / pRx, (yAdj - gaze.y) / pRy);
      const irisDist = Math.hypot((x - gaze.x) / iRx, (yAdj - gaze.y) / iRy);
      const edge = inside ? Math.max(0, 1 - Math.abs(Math.abs(yAdj) - half) / 0.13) : 0;
      const lid = edge > 0.36;

      let density = 0;
      let isIris = false;
      if (lid) density = 0.92 + edge * 0.08;
      else if (!inside) density = 0.72;
      else if (pupilDist < 1) density = 0;
      else if (pupilDist < 1.18) {
        density = 0.97;
        isIris = true;
      } else if (irisDist < 1) {
        density = 0.7 + (1 - irisDist) * 0.2;
        isIris = irisDist > 0.45;
      } else density = 0.6 + noise(2) * 0.1;

      density += (noise(4) - 0.5) * 0.025;
      if (reforming) density = Math.min(0.98, density + 0.12);

      if (noise(0) > Math.min(0.98, density)) {
        line += ' ';
        irisLine += ' ';
        continue;
      }

      let glyph: string;
      if (isIris) glyph = pick(IRIS_GLYPHS, noise(5));
      else if (lid) glyph = pick(EDGE_GLYPHS, noise(6));
      else glyph = pick(FIELD_GLYPHS, noise(7));
      if (noise(8) < 0.02) glyph = 'x';

      line += glyph;
      irisLine += isIris ? glyph : ' ';
    }

    rows.push(line);
    irisRows.push(irisLine);
  }

  return { rows, irisRows };
}

export function applyMutations(mesh: RasterMesh, mutations: Mutation[]): RasterMesh {
  if (mutations.length === 0) return mesh;

  const rows = mesh.rows.map((row) => row.split(''));
  const irisRows = mesh.irisRows.map((row) => row.split(''));

  for (const mutation of mutations) {
    const row = rows[mutation.row];
    const iris = irisRows[mutation.row];
    if (!row || !iris || mutation.col < 0 || mutation.col >= row.length) continue;
    if (mutation.char.length !== 1) continue;
    row[mutation.col] = mutation.char;
    if (mutation.char === ' ') iris[mutation.col] = ' ';
    else if (iris[mutation.col] !== ' ') iris[mutation.col] = mutation.char;
  }

  return {
    rows: rows.map((row) => row.join('')),
    irisRows: irisRows.map((row) => row.join('')),
  };
}

export function collectFilled(rows: string[]): Array<{ row: number; col: number }> {
  const cells: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < rows.length; row += 1) {
    const line = rows[row];
    for (let col = 0; col < line.length; col += 1) {
      if (line[col] !== ' ') cells.push({ row, col });
    }
  }
  return cells;
}
