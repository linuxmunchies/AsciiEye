import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'AsciiEye', template: '%s · AsciiEye' },
  description: 'A watchful terminal landing page. The interface notices you.',
  openGraph: {
    title: 'AsciiEye',
    description: 'A watchful terminal landing page. The interface notices you.',
    images: [
      {
        url: '/og.png',
        width: 1733,
        height: 908,
        alt: 'An abstract terminal eye',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AsciiEye',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
