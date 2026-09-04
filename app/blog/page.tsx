import type { Metadata } from 'next';
import { LivePage } from '../live-page';

export const metadata: Metadata = { title: 'Blog' };
export default function BlogPage() {
  return <LivePage title="BLOG" />;
}
