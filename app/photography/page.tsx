import type { Metadata } from 'next';
import { LivePage } from '../live-page';

export const metadata: Metadata = { title: 'Photography' };
export default function PhotographyPage() {
  return <LivePage title="PHOTOGRAPHY" />;
}
