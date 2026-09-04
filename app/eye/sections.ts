import type { Gaze } from './raster';

export type Section = {
  id: string;
  label: string;
  href: string;
  color: string;
  gaze: Gaze;
  /** Degrees; must match `.orbit-link--*` in globals.css. */
  orbitAngle: number;
};

/** Visual order: top-right → right → bottom-right. Tab order matches. */
export const sections: Section[] = [
  {
    id: 'about',
    label: 'ABOUT',
    href: '/about',
    color: '#00F7FF',
    gaze: { x: 0.34, y: -0.37 },
    orbitAngle: -80,
  },
  {
    id: 'projects',
    label: 'PROJECTS',
    href: '/projects',
    color: '#39FF94',
    gaze: { x: 0.5, y: -0.24 },
    orbitAngle: -48,
  },
  {
    id: 'blog',
    label: 'BLOG',
    href: '/blog',
    color: '#CFFF4D',
    gaze: { x: 0.58, y: -0.08 },
    orbitAngle: -16,
  },
  {
    id: 'greetings',
    label: 'GREETINGS',
    href: '/greetings',
    color: '#A259FF',
    gaze: { x: 0.58, y: 0.08 },
    orbitAngle: 16,
  },
  {
    id: 'music',
    label: 'MUSIC',
    href: '/music',
    color: '#FF48FF',
    gaze: { x: 0.5, y: 0.24 },
    orbitAngle: 48,
  },
  {
    id: 'photography',
    label: 'PHOTOGRAPHY',
    href: '/photography',
    color: '#4DA2FF',
    gaze: { x: 0.34, y: 0.37 },
    orbitAngle: 80,
  },
];

export function sectionById(id: string): Section {
  const found = sections.find((section) => section.id === id);
  if (!found) throw new Error(`Unknown section: ${id}`);
  return found;
}
