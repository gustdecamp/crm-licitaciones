import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Panel Pau — Gust de Camp & Ulivarda",
  description:
    "Panel de licitaciones y subvenciones para Gust de Camp y Ulivarda",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#32542b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
