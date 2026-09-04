import type { Metadata } from 'next';
import { sectionById } from '../eye/sections';
import { LivePage } from '../live-page';

const section = sectionById('photography');

export const metadata: Metadata = { title: 'Photography' };
export default function PhotographyPage() {
  return <LivePage title={section.label} accent={section.color} />;
}
