import { metadata } from "./metadata";
export { metadata };

export default function CategoriesLayout({ 
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