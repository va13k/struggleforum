import Image from "next/image";
import PageWrapper from "@/components/UI/PageWrapper";
import PageHeader from "@/components/UI/PageHeader";
import TextBox from "@/components/UI/TextBox";
import ParagraphLayout from "@/components/UI/ParagraphLayout";
import Link from "next/link";

export default function BookPage() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

  return (
    <PageWrapper>
      <PageHeader>
        <h1 className="text-5xl uppercase">Shards Of Struggle</h1>
        <h3 className="text-3xl text-sky-400">
          Book of Shards? Or Book about Struggle?
        </h3>
        <h3 className="text-3xl text-sky-400">It's up to you</h3>
      </PageHeader>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-10 w-full">
        <Link
          href="https://www.amazon.com/dp/B0G1VWHQFZ"
          className="w-full max-w-[400px] sm:max-w-[320px] lg:max-w-[420px] rounded-2xl overflow-hidden transition-transform duration-500 hover:scale-105"
        >
          <Image
            src={base + "/Sbook.jpg"}
            width={1600}
            height={2560}
            alt="'Shards Of Struggle' book cover"
            className="w-full h-auto max-h-[80vh] rounded-2xl"
            priority
          />
        </Link>

        <TextBox className="flex-1">
          <h3 className="text-3xl mb-4">About the Book</h3>
          <ParagraphLayout>
            "Shards of Struggle" is not a guide for avoiding difficulties, but a
            tool to understand and navigate them. It provides strategies for
            conscious perception, personal growth, and building inner strength.
          </ParagraphLayout>
          <ParagraphLayout>
            The book shows how to recognize patterns, analyze challenges, and
            act deliberately rather than reactively. It teaches awareness,
            discipline, and turning resistance into opportunity.
          </ParagraphLayout>
          <ParagraphLayout className="mb-6">
            Ideal for anyone seeking clarity, resilience, and strategic
            thinking. Life is struggle — and "Shards of Struggle" is your
            compass to face it consciously.
          </ParagraphLayout>
        </TextBox>
      </div>

      <TextBox>
        <h3 className="text-3xl mb-6">What You'll Learn</h3>
        <div className="grid sm:grid-cols-2 gap-6 text-left">
          <div>
            <h4 className="text-xl font-bold mb-2 text-sky-300">
              🧭 Navigate Challenges
            </h4>
            <ParagraphLayout>
              Recognize patterns, understand hidden currents, and make strategic
              decisions with clarity.
            </ParagraphLayout>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-2 text-sky-300">
              💪 Build Inner Strength
            </h4>
            <ParagraphLayout>
              Transform resistance into power, develop discipline, and fortify
              your mental resilience.
            </ParagraphLayout>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-2 text-sky-300">
              🎯 Act Consciously
            </h4>
            <ParagraphLayout>
              Move from reactive to deliberate action, manage attention and
              energy effectively.
            </ParagraphLayout>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-2 text-sky-300">
              🔍 See Beyond Chaos
            </h4>
            <ParagraphLayout>
              Perceive invisible patterns, understand social dynamics, and chart
              your own path.
            </ParagraphLayout>
          </div>
        </div>
      </TextBox>
    </PageWrapper>
  );
}
