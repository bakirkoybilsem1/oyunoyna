import './globals.css';

export const metadata = {
  title: 'OyunOyna 🎮',
  description: 'Çocuklar için ücretsiz online oyunlar!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
