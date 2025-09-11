import { metadata } from "./metadata";
export { metadata };
// We can safely export metadata from this server component

export default function SuccessStoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
