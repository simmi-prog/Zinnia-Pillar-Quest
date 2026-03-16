import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zinnia Pillar Quest",
  description: "Strong Pillars. Stronger Guessing Skills 🤪",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
