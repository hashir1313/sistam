import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The System // Solo Leveling Growth App',
  description: 'Gamified real-world quest log and hunter status allocator inspired by Solo Leveling.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-[#070A10] text-slate-100 antialiased min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
