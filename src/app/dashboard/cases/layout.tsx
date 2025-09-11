import { metadata } from "./metadata";
export { metadata };

export default function CasesLayout({ 
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