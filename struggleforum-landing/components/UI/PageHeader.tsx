import { PropsWithChildren } from "react";

export default function PageHeader({ children }: PropsWithChildren) {
  return <div className="text-left">{children}</div>;
}
