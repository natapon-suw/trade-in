import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  title: 'Trade-In Platform',
  description: 'Second-hand electronics trade-in platform',
};

/*
 * TODO: Configure shadcn/ui components library.
 * Tailwind CSS is set up and ready. shadcn/ui will be added
 * when interactive CLI setup is available.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center px-4">
            <h1 className="text-lg font-semibold">Trade-In Platform</h1>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
