"use client";

import { PropsWithChildren, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";

const bgmap: Array<{ test: (p: string) => boolean; url: string }> = [
  { test: (p) => p === "/", url: "/main-bg.jpg" },
  { test: (p) => p.startsWith("/about"), url: "/about-bg.jpg" },
  { test: (p) => p.startsWith("/book"), url: "/book-bg.jpg" },
  { test: (p) => p.startsWith("/coordination"), url: "/coordination-bg.jpg" },
  { test: (p) => p.startsWith("/contact"), url: "/contact-bg.jpg" },
];

export default function BackgroundProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const bg = useMemo(
    () => bgmap.find((x) => x.test(pathname))?.url ?? "/main-bg.jpg",
    [pathname]
  );

  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const fullUrl = `${base}${bg}`;

  useEffect(() => {
    document.body.style.setProperty("--main-bg", `url(${fullUrl})`);
    return () => {};
  }, [fullUrl]);

  return (
    <div className="min-h-screen flex flex-col items-center pt-[70px]">
      {children}
    </div>
  );
}
