import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Digital Wave HRM",
    template: "%s | Digital Wave HRM",
  },
  description:
    "Enterprise Human Resource Management platform by Digital Wave",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="wave-background min-h-full">
        {children}
      </body>
    </html>
  );
}
