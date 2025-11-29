import Video from "@/components/Video";

export default function Home() {
  return (
    <div className="min-h-screen w-[80%] flex flex-col gap-6 justify-center pt-5 pb-5">
      <div className="text-left">
        <h1 className="text-5xl">Struggle Forum</h1>
        <h3 className="text-3xl text-sky-400">Struggle shapes the world</h3>
      </div>
      <Video src="/istruggle_video.mp4" className="m-auto w-full" />
      <div className="flex flex-col justify-center items-center text-left bg-slate-800/80 shadow-[0_2px_10px_rgba(0,0,0,0.3)] rounded-2xl p-10 text-xl">
        <h3 className="text-3xl mb-4">Philosophy of Struggle</h3>
        <p className="mb-3">
          Human life is an endless network of paths, trails, and currents,
          intertwining, diverging, and meeting again. Every day we face choices,
          resistance from the world around us, and our own inner doubts. We are
          born into a world where nothing is given permanently, and every moment
          is an opportunity to encounter difficulty, to test our strength and
          our boundaries.
        </p>
        <p className="mb-3">
          This book does not offer easy answers or tell you how to avoid storms.
          It offers tools for conscious perception, analysis, and strategy. It
          helps to see the flows of interactions around us, understand hidden
          connections, recognize patterns, and navigate our own trajectories of
          action.
        </p>
        <p className="mb-3">
          For those seeking to strengthen their inner discipline, prepare for
          life’s challenges, and act with awareness, this book serves as a
          compass. For those caught in complex social or professional
          labyrinths, it provides a key to understanding hidden currents of
          influence, preserving inner strength and clarity, and making decisions
          with confidence and dignity.
        </p>
        <p className="mb-3">
          The philosophy of Struggle teaches that resistance is inevitable — but
          it is not an enemy. Through resistance, strength is forged; through
          understanding flows, chaos becomes a tool; and through conscious
          action, we chart our own path. Every day, every encounter, every
          challenge is an opportunity to strengthen oneself, become more aware,
          and move freely.
        </p>
        <p>
          This book is written for those who wish to become architects of their
          own lives, learn to manage attention and energy, navigate complex
          situations, and perceive patterns invisible to most. Life is Struggle.
          Understanding this transforms chaos into a path, resistance into
          strength, and every moment into a chance to become stronger, clearer,
          and freer.
        </p>
      </div>
    </div>
  );
}
