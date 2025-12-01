import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function TextBox({ children, className }: Props) {
  return (
    <div
      className={`flex flex-col justify-center text-left bg-slate-800/80 shadow-[0_2px_10px_rgba(0,0,0,0.3)] rounded-2xl p-10 text-xl ${className}`}
    >
      {children}
    </div>
  );
}
