"use client";

import Link from "next/link";
import React from "react";

type CTButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
};

const base =
  "inline-flex items-center justify-center select-none rounded-xl font-bold transition-all duration-700 focus:outline-none focus:ring-2 focus:ring-sky-300/60 disabled:opacity-60 disabled:cursor-not-allowed";

const variants: Record<NonNullable<CTButtonProps["variant"]>, string> = {
  primary:
    "bg-sky-500 text-white hover:bg-sky-400 shadow-[0_8px_24px_rgba(56,189,248,0.35)] hover:shadow-[0_10px_30px_rgba(56,189,248,0.5)] hover:scale-105",
  secondary:
    "bg-slate-700 text-sky-200 hover:bg-slate-600 shadow-[0_6px_18px_rgba(2,6,23,0.5)] hover:shadow-[0_8px_22px_rgba(2,6,23,0.6)]",
  ghost:
    "bg-transparent text-sky-300 hover:text-sky-400 border border-sky-500/40 hover:border-sky-400/70 shadow-none",
};

const sizes: Record<NonNullable<CTButtonProps["size"]>, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-base px-6 py-3",
  lg: "text-lg px-8 py-4",
};

export default function CTButton({
  children,
  href,
  onClick,
  className = "",
  variant = "primary",
  size = "md",
  fullWidth = false,
}: CTButtonProps) {
  const classes = [
    base,
    variants[variant],
    sizes[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
