import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "同人誌マネージャー | 在庫・売上・イベントをひとつで管理",
  description: "同人作家のための管理ツール。コミケ当日もスマホから売上を記録。在庫状況をお客さんと共有できる公開ページも作成できます。無料で始められます。",
  verification: {
    google: "I6ffD0lbvZUruWik4PIhOER00Txd0QxRKAH4FpPcUDM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}