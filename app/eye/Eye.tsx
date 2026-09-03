import type { CSSProperties } from 'react';

type EyeProps = {
  rows: string[];
  irisRows: string[];
  desyncRows?: number[];
};

const CENTER_ROW = 10;

export function Eye({ rows, irisRows, desyncRows = [] }: EyeProps) {
  const desync = new Set(desyncRows);

  return (
    <div className="glyph-eye">
      <pre className="eye-shell" aria-hidden="true">
        {rows.map((row, index) => (
          <span
            className={`eye-row eye-row--${index + 1}${desync.has(index) ? ' is-desync' : ''}`}
            key={index}
            style={{ '--row-from-center': Math.abs(index - CENTER_ROW) } as CSSProperties}
          >
            {row}
          </span>
        ))}
      </pre>
      <pre className="eye-iris" aria-hidden="true">
        {irisRows.map((row, index) => (
          <span
            className={`eye-row eye-row--${index + 1}`}
            key={index}
            style={{ '--row-from-center': Math.abs(index - CENTER_ROW) } as CSSProperties}
          >
            {row}
          </span>
        ))}
      </pre>
    </div>
  );
}
