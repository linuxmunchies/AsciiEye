import type { CSSProperties } from 'react';
import { EYE_ROWS } from './raster';

type EyeProps = {
  rows: string[];
  irisRows: string[];
  desyncRows?: number[];
};

const CENTER_ROW = (EYE_ROWS - 1) / 2;

const rowClass = (index: number, desync: Set<number>) =>
  `eye-row${desync.has(index) ? ' is-desync' : ''}`;

export function Eye({ rows, irisRows, desyncRows = [] }: EyeProps) {
  const desync = new Set(desyncRows);

  return (
    <div className="glyph-eye">
      <pre className="eye-shell" aria-hidden="true">
        {rows.map((row, index) => (
          <span
            className={rowClass(index, desync)}
            key={index}
            style={
              {
                '--row-from-center': Math.abs(index - CENTER_ROW),
              } as CSSProperties
            }
          >
            {row}
          </span>
        ))}
      </pre>
      <pre className="eye-iris" aria-hidden="true">
        {irisRows.map((row, index) => (
          <span
            className={rowClass(index, desync)}
            key={index}
            style={
              {
                '--row-from-center': Math.abs(index - CENTER_ROW),
              } as CSSProperties
            }
          >
            {row}
          </span>
        ))}
      </pre>
    </div>
  );
}
