import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Eye } from './eye/Eye';
import { rasterEye } from './eye/raster';

const watch = rasterEye({ gazeX: 0.28, gazeY: 0.36 });

export function LivePage({ title, accent }: { title: string; accent: string }) {
  return (
    <main
      className="live-page"
      style={{ '--active-accent': accent } as CSSProperties}
    >
      <div className="field-grain" aria-hidden="true" />
      <section className="live-eye" aria-hidden="true">
        <div className="eye-stage">
          <Eye rows={watch.rows} irisRows={watch.irisRows} />
        </div>
      </section>
      <div className="live-copy">
        <h1>{title}</h1>
        <p>THIS IS LIVE</p>
        <Link href="/">BACK</Link>
      </div>
    </main>
  );
}
