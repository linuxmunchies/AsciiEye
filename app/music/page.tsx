import type { Metadata } from 'next';
import { sectionById } from '../eye/sections';
import { LivePage } from '../live-page';

const section = sectionById('music');

export const metadata: Metadata = { title: 'Music' };
export default function MusicPage() {
  return <LivePage title={section.label} accent={section.color} />;
}
