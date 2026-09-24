import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import RoleRouteGuard from "@/components/RoleRouteGuard";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UA-EVAA",
  description: "Aplikasi UA-EVAA - Modul IPA Digital",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <AuthProvider>
          <RoleRouteGuard>{children}</RoleRouteGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
