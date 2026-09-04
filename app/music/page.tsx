import type { Metadata } from 'next';
import { LivePage } from '../live-page';

export const metadata: Metadata = { title: 'Music' };
export default function MusicPage() {
  return <LivePage title="MUSIC" />;
}
