import type { Metadata } from 'next';
import './global.css';
import { AuthProvider } from '../lib/auth-context';

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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
