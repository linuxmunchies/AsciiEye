import type { Metadata } from 'next';
import { sectionById } from '../eye/sections';
import { LivePage } from '../live-page';

const section = sectionById('blog');

export const metadata: Metadata = { title: 'Blog' };
export default function BlogPage() {
  return <LivePage title={section.label} accent={section.color} />;
}
