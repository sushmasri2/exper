import { metadata } from "./metadata";
export { metadata };

export default function PartnersLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {children}
    </div>
  );
}