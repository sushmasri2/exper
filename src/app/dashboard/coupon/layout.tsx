import { metadata } from "./metadata";
export { metadata };

export default function CouponLayout({ 
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