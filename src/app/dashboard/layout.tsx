import { DashboardClient } from "./dashboard-client";
// Importing metadata for Next.js support
import { metadata } from "./metadata";
export { metadata };
// We can safely export metadata from this server component

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardClient>{children}</DashboardClient>;
}
