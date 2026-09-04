import type { Metadata } from 'next';
import { LivePage } from '../live-page';

export const metadata: Metadata = { title: 'About' };
export default function AboutPage() {
  return <LivePage title="ABOUT" />;
}
