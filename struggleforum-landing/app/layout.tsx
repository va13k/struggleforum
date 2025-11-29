import "./global.css";
import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
      <body
        className="min-h-screen flex flex-col items-center pt-[70px]"
        style={{
          ["--main-bg" as any]: `url(${
            process.env.NEXT_PUBLIC_BASE_PATH ?? ""
          }/pexels-horribils-20276206.jpg)`,
          ["--logo-bg" as any]: `url(${
            process.env.NEXT_PUBLIC_BASE_PATH ?? ""
          }/Struggleend.png)`,
        }}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
