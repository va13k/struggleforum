"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const navItems = [
  { href: "/about", label: "About" },
  { href: "/book", label: "Book" },
  { href: "/coordination", label: "Coordination" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();

  const isActive = useMemo(
    () => (href: string) =>
      href === "/" ? pathname === "/" : pathname?.startsWith(href),
    [pathname]
  );

  return (
    <header className="sticky py-2.5 px-5 text-2xl font-bold text-white bg-slate-800/80 shadow-[0_2px_10px_rgba(0,0,0,0.3)] z-20 flex justify-between items-center">
      <Link href="/">
        <span className="text-5xl font-bold text-sky-400 opacity-80  pointer-events-none select-none transform-none text-glow-cyan">
          SF
        </span>
      </Link>
      <nav>
        <ul className="flex items-center gap-6">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "text-lg font-semibold transition-colors",
                    active ? "text-sky-300" : "text-white/90 hover:text-white",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
