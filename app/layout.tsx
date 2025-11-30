import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinCraft AI - Your Personalized Portfolio Architect",
  description: "AI-powered personalized investment portfolio recommendations based on your financial goals and risk tolerance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
