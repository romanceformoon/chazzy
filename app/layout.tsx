import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <title>Chazzy for TTS</title>
      </head>
      <body style={{ margin: 0 }}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
