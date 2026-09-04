import type { Gaze } from './raster';

export type Section = {
  id: string;
  label: string;
  href: string;
  color: string;
  gaze: Gaze;
};

/** Visual order: top-right → right → bottom-right. Tab order matches. */
export const sections: Section[] = [
  { id: 'about', label: 'ABOUT', href: '/about', color: '#00F7FF', gaze: { x: 0.34, y: -0.37 } },
  { id: 'projects', label: 'PROJECTS', href: '/projects', color: '#39FF94', gaze: { x: 0.5, y: -0.24 } },
  { id: 'blog', label: 'BLOG', href: '/blog', color: '#CFFF4D', gaze: { x: 0.58, y: -0.08 } },
  { id: 'greetings', label: 'GREETINGS', href: '/greetings', color: '#A259FF', gaze: { x: 0.58, y: 0.08 } },
  { id: 'music', label: 'MUSIC', href: '/music', color: '#FF48FF', gaze: { x: 0.5, y: 0.24 } },
  { id: 'photography', label: 'PHOTOGRAPHY', href: '/photography', color: '#4DA2FF', gaze: { x: 0.34, y: 0.37 } },
];
