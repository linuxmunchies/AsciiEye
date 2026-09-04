import type { Metadata } from 'next';
import { sectionById } from '../eye/sections';
import { LivePage } from '../live-page';

const section = sectionById('projects');

export const metadata: Metadata = { title: 'Projects' };
export default function ProjectsPage() {
  return <LivePage title={section.label} accent={section.color} />;
}
