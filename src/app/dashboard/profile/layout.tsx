import { metadata } from "./metadata";
export { metadata };

export default function ProfileLayout({ 
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