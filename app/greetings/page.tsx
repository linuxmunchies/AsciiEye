import type { Metadata } from 'next';
import { sectionById } from '../eye/sections';
import { LivePage } from '../live-page';

const section = sectionById('greetings');

export const metadata: Metadata = { title: 'Greetings' };
export default function GreetingsPage() {
  return <LivePage title={section.label} accent={section.color} />;
}
