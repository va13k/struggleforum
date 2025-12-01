import { PropsWithChildren } from "react";

export default function PageWrapper({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen w-[80%] flex flex-col gap-6 justify-center pt-5 pb-5">
      {children}
    </div>
  );
}
