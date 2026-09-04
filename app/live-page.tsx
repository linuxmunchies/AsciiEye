import Link from 'next/link';

export function LivePage({ title }: { title: string }) {
  return (
    <main className="live-page">
      <h1>{title}</h1>
      <p>THIS IS LIVE</p>
      <Link href="/">BACK</Link>
    </main>
  );
}
