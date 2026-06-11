import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ひとりビジネス適性診断 | 関達也監修",
  description:
    "独立31年・11種のビジネスを実践し、3,000名以上を直接サポートしてきた関達也が監修。15問に答えるだけで、あなたに向いているひとりビジネスのタイプがわかります。",
  openGraph: {
    title: "ひとりビジネス適性診断 | 関達也監修",
    description:
      "独立31年・11種のビジネスを実践し、3,000名以上を直接サポートしてきた関達也が監修。15問に答えるだけで、あなたに向いているひとりビジネスのタイプがわかります。",
    url: "https://hitorigoto-shindan.vercel.app",
    images: [
      {
        url: "https://hitorigoto-shindan.vercel.app/og-image.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ひとりビジネス適性診断 | 関達也監修",
    description:
      "独立31年・11種のビジネスを実践し、3,000名以上を直接サポートしてきた関達也が監修。15問に答えるだけで、あなたに向いているひとりビジネスのタイプがわかります。",
    images: ["https://hitorigoto-shindan.vercel.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
