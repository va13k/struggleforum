import Video from "@/components/Video";
import TextBox from "@/components/UI/TextBox";
import ParagraphLayout from "@/components/UI/ParagraphLayout";
import PageWrapper from "@/components/UI/PageWrapper";
import PageHeader from "@/components/UI/PageHeader";

export default function Home() {
  return (
    <PageWrapper>
      <PageHeader>
        <h1 className="text-5xl">Struggle Forum</h1>
        <h3 className="text-3xl text-sky-400">Struggle shapes the world</h3>
      </PageHeader>
      <Video src="main-video.mp4" className="m-auto w-[80%] rounded-3xl" />
      <TextBox>
        <h3 className="text-3xl mb-4">Philosophy of Struggle</h3>
        <ParagraphLayout>
          Human life is an endless network of paths, trails, and currents,
          intertwining, diverging, and meeting again. Every day we face choices,
          resistance from the world around us, and our own inner doubts. We are
          born into a world where nothing is given permanently, and every moment
          is an opportunity to encounter difficulty, to test our strength and
          our boundaries.
        </ParagraphLayout>
        <ParagraphLayout>
          This book does not offer easy answers or tell you how to avoid storms.
          It offers tools for conscious perception, analysis, and strategy. It
          helps to see the flows of interactions around us, understand hidden
          connections, recognize patterns, and navigate our own trajectories of
          action.
        </ParagraphLayout>
        <ParagraphLayout>
          For those seeking to strengthen their inner discipline, prepare for
          life’s challenges, and act with awareness, this book serves as a
          compass. For those caught in complex social or professional
          labyrinths, it provides a key to understanding hidden currents of
          influence, preserving inner strength and clarity, and making decisions
          with confidence and dignity.
        </ParagraphLayout>
        <ParagraphLayout>
          The philosophy of Struggle teaches that resistance is inevitable — but
          it is not an enemy. Through resistance, strength is forged; through
          understanding flows, chaos becomes a tool; and through conscious
          action, we chart our own path. Every day, every encounter, every
          challenge is an opportunity to strengthen oneself, become more aware,
          and move freely.
        </ParagraphLayout>
        <ParagraphLayout className="mb-0">
          This book is written for those who wish to become architects of their
          own lives, learn to manage attention and energy, navigate complex
          situations, and perceive patterns invisible to most. Life is Struggle.
          Understanding this transforms chaos into a path, resistance into
          strength, and every moment into a chance to become stronger, clearer,
          and freer.
        </ParagraphLayout>
      </TextBox>
    </PageWrapper>
  );
}
