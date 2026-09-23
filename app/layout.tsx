import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zerspaner Guru | Schnittdatenrechner",
  description: "Drehzahl und Vorschub für Fräsen und Bohren schnell berechnen.",
  icons: {
    icon: "/zerspaner-guru-logo.jpeg",
    shortcut: "/zerspaner-guru-logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
