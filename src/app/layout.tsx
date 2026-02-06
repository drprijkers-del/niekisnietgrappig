import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getCurrentSite } from "@/lib/sites";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getCurrentSite();
  const baseUrl = `https://${site.domain}`;

  return {
    title: {
      template: site.meta.titleTemplate,
      default: site.meta.defaultTitle,
    },
    description: site.meta.description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      siteName: site.siteName,
      locale: "nl_NL",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
    icons: {
      icon: "/icon.svg",
      apple: "/icon.svg",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
