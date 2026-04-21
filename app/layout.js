import "./globals.css";

export const metadata = {
  title: "Bakbi Oyun Parkı",
  description: "Çocuklar için eğlenceli HTML oyunları",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
