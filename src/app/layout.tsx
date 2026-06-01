import type { Metadata } from "next";
import localFont from "next/font/local";
import { Poppins } from "next/font/google";
import "./globals.css";

const nohemi = localFont({
  src: [
    {
      path: "../fonts/Nohemi-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../fonts/Nohemi-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../fonts/Nohemi-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/Nohemi-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Nohemi-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Nohemi-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/Nohemi-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/Nohemi-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../fonts/Nohemi-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-nohemi",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Kavindu Shehan — Designer, Developer & Animator",
  description: "Multi-disciplinary creator based in Colombo, Sri Lanka. Bridging design, frontend development, and motion animation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nohemi.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

