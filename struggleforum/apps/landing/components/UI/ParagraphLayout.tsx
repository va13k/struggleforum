import React from "react";

type ParagraphLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export default function ParagraphLayout({
  children,
  className,
}: ParagraphLayoutProps) {
  return <p className={`${className ?? "mb-3"}`}>{children}</p>;
}
