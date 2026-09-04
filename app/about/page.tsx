import type { Metadata } from 'next';
import { sectionById } from '../eye/sections';
import { LivePage } from '../live-page';

const section = sectionById('about');

export const metadata: Metadata = { title: 'About' };
export default function AboutPage() {
  return <LivePage title={section.label} accent={section.color} />;
}
