import "./global.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/src/features/auth/AuthProvider";
import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer";

export const metadata: Metadata = {
  title: "StruggleForum",
  description: "Discuss, share, and connect with the StruggleForum community.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
