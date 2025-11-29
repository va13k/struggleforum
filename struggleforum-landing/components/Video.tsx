"use client";

type Props = {
  src: string;
  className?: string;
};

export default function Video({ src, className }: Props) {
  return (
    <div className={["video-block", className].join(" ")}>
      <video
        controls
        className="w-full h-auto rounded-lg"
        src={src}
        preload="metadata"
      />
    </div>
  );
}
