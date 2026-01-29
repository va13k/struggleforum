"use client";

type Props = {
  src: string;
  className?: string;
};

export default function Video({ src, className }: Props) {
  return (
    <div className={className}>
      <video
        className="w-full rounded-2xl"
        controls
        src={src}
        preload="metadata"
      />
    </div>
  );
}
