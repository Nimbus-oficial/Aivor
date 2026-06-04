import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aivor",
  description: "Conta rendimento em USDC com experiencia de banco digital."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
