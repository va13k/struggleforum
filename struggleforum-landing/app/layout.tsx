import "./global.css";
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackgroundProvider from "@/components/UI/BackgroundProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <body>
        <BackgroundProvider>
          <Header />
          {children}
          <Footer />
        </BackgroundProvider>
      </body>
    </html>
  );
}
