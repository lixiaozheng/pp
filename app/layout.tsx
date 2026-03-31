import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Strong Password Generator | Fast, Secure, and Easy to Understand",
  description:
    "Generate secure passwords, passphrases, and PINs locally in your browser. Built for real people with clear guidance, instant copy, and modern security advice.",
  openGraph: {
    title: "Strong Password Generator",
    description:
      "Generate secure passwords, passphrases, and PINs locally in your browser with clear guidance for every account type.",
    url: siteUrl,
    siteName: "Strong Password Generator",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Strong Password Generator",
    description:
      "Generate strong passwords, memorable passphrases, and secure PINs locally in your browser.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
