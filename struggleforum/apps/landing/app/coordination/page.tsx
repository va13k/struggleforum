import { PageWrapper } from "@struggleforum/ui";
import PageHeader from "@/components/UI/PageHeader";
import TextBox from "@/components/UI/TextBox";
import ParagraphLayout from "@/components/UI/ParagraphLayout";
import Image from "next/image";
import { CTButton } from "@struggleforum/ui";

export default function CoordinationPage() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

  return (
    <PageWrapper>
      <PageHeader>
        <h1 className="text-5xl">Coordination Process</h1>
      </PageHeader>
      <div className="flex items-center gap-15">
        <TextBox>
          <h3 className="text-3xl mb-4">SF Coordination</h3>
          <ParagraphLayout>
            It was a distant October, 2025. In a world of complexity and
            uncertainty, each choice carries weight. The path is rarely clear,
            and challenges often appear without warning. Yet within these
            moments of tension and doubt, clarity can be found.
          </ParagraphLayout>
          <ParagraphLayout>
            The Struggle forum serves as a space for reflection, understanding,
            and deliberate action. Coordinator Emin provides guidance, ensuring
            that those navigating the intricate currents of life can do so with
            focus and insight.
          </ParagraphLayout>
          <ParagraphLayout>
            Here, every challenge becomes an opportunity to perceive patterns,
            analyze situations, and act with intention. Awareness replaces
            confusion, and conscious action guides the way. Struggle is not
            about triumph—it is about presence, understanding, and navigating
            the complexities of the world with clarity.
          </ParagraphLayout>
          <ParagraphLayout className="mb-6">
            Join the discourse. Explore the currents. Move forward with
            awareness.
          </ParagraphLayout>
          <CTButton
            href="https://www.instagram.com/info.eminbairamov"
            variant="primary"
          >
            Contact Struggle Coordinator Emin
          </CTButton>
        </TextBox>
        <div className="flex-col items-center justify-center gap-15">
          <Image
            width={567}
            height={850}
            src={base + "/Emin_Bairamov.jpg"}
            alt={"Emin Bairamov photo"}
            className="rounded-2xl"
          />
          <ParagraphLayout>Coordinator Emin Bairamov</ParagraphLayout>
        </div>
      </div>
    </PageWrapper>
  );
}
