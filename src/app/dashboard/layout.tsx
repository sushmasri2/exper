import { DashboardClient } from "./dashboard-client";
import { Metadata } from "next";

// We can safely export metadata from this server component
export const metadata: Metadata = {
  title: "Dashboard | MedAI Content",
  description: "Manage your MedAI content from the dashboard.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardClient>{children}</DashboardClient>;
}
