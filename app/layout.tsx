import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CartProvider } from '@/components/cart-context';
import { Navbar } from '@/components/navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Simple Shop',
  description: 'A simple Next.js ecommerce starter',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <div className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />
            <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
