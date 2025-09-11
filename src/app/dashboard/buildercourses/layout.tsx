import { metadata } from "./metadata";
export { metadata };

export default function BuilderCoursesLayout({ 
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