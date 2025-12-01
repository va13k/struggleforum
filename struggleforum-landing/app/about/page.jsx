import TextBox from "@/components/UI/TextBox";
import ParagraphLayout from "@/components/UI/ParagraphLayout";

export default function AboutPage() {
  return (
    <div className="min-h-screen w-[80%] flex flex-col gap-6 justify-center pt-5 pb-5">
      <div className="text-left">
        <h1 className="text-5xl">About Struggle</h1>
        <h3 className="text-3xl text-sky-400">Struggle shapes the world</h3>
      </div>
      <TextBox>
        <h3 className="text-3xl mb-4">Philosophy and Life</h3>
        <ParagraphLayout>
          Life is a tangled web of paths, a labyrinth of challenges and
          unexpected turns. Within this chaos, we often lose our bearings, feel
          the weight of circumstances, and wrestle with our inner doubts. It
          seems that every step leads only deeper into confusion, that the maze
          has no exit. Yet, within these complex moments, the technologies of
          inner strength are born.
        </ParagraphLayout>
        <ParagraphLayout>
          Analysis, attention to detail, understanding cause and effect — these
          are the tools that transform chaos into a map, uncertainty into
          guidance. Every convoluted moment is an opportunity to untangle
          threads, to see hidden connections, and to make decisions that propel
          us forward.
        </ParagraphLayout>
        <ParagraphLayout>
          Struggle teaches us to turn resistance into mastery. The dark corners
          of mind and circumstance become the ground where we cultivate pattern
          recognition, forecast consequences, and design strategies. Where the
          world feels opaque and intimidating, we discover the light of clarity
          and confidence. Every obstacle is an algorithm for strength; every
          intricate situation is a code waiting to be deciphered.
        </ParagraphLayout>
        <ParagraphLayout>
          Struggle is not merely battling the outside world — it is the art of
          solving complex problems, maintaining clarity, and moving toward
          purpose, even when chaos surrounds us. Darkness does not consume those
          who can see the light. It tests their focus, willpower, and strategy.
          And light — the light of knowledge, awareness, and deliberate action —
          guides them through.
        </ParagraphLayout>
        <ParagraphLayout className="mb-0">
          Struggle is mastery in chaos, illumination in the labyrinth, and a map
          for those who seek the path.
        </ParagraphLayout>
      </TextBox>
    </div>
  );
}
