import type { Metadata } from 'next';
import { LivePage } from '../live-page';

export const metadata: Metadata = { title: 'Projects' };
export default function ProjectsPage() {
  return <LivePage title="PROJECTS" />;
}
