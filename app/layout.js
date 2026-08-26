export const metadata = {
  title: "Дневник роста",
  description: "Личный трекер целей с AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
