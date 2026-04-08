import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StellarShield AI - Intelligent Security for Stellar',
  description:
    'AI-powered security monitoring agent for Stellar wallets. Detect threats, analyze transactions, and protect your assets with x402 micropayments.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gradient-animated">
        {children}
      </body>
    </html>
  );
}
