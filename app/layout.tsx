import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Unidentified Signal',
  description: 'A personal transmission from an unidentified signal.',
  openGraph: {
    title: 'Unidentified Signal',
    description: 'A personal transmission from an unidentified signal.',
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: 'An abstract terminal eye' }],
  },
  twitter: { card: 'summary_large_image', title: 'Unidentified Signal', images: ['/og.png'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
