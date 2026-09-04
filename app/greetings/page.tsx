import type { Metadata } from 'next';
import { LivePage } from '../live-page';

export const metadata: Metadata = { title: 'Greetings' };
export default function GreetingsPage() {
  return <LivePage title="GREETINGS" />;
}
