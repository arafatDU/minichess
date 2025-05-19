
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MiniChess',
  description: 'A 6x5 chess-like game with AI opponent',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js" crossOrigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js" crossOrigin="anonymous"></script>
      </head>
      <body className="bg-gray-100 flex justify-center items-center min-h-screen">{children}</body>
    </html>
  );
}
