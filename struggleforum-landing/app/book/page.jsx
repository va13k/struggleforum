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
      <div className="flex justify-center gap-5">
        <Link
          href="#"
          className="w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[400px] h-[80%] rounded-2xl drop-shadow-2xl overflow-hidden transition-transform duration-1000 hover:scale-105"
        >
          <Image
            src={base + "/Sbook.jpg"}
            width={1600}
            height={2560}
            alt="'Shards Of Struggle' book cover"
          />
        </Link>
        <TextBox>
          <h3 className="text-3xl mb-4">About Book</h3>
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
          <ParagraphLayout>
            Ideal for anyone seeking clarity, resilience, and strategic
            thinking. Life is struggle — and "Shards of Struggle" is your
            compass to face it consciously.
          </ParagraphLayout>
        </TextBox>
      </div>
    </PageWrapper>
  );
}
