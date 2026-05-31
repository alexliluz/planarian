import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Home | Kleiner Perkins",
  description: "Formal clone scaffold for https://www.kleinerperkins.com/"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
