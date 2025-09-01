"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import styles from "./dashboard-layout.module.css";
import { ModeToggle } from "@/components/theme-toggle-button";
import { UserAvatar } from "@/components/user-avatar";
import ProtectedRoute from "@/components/protected-route";
import Breadcrumb from "@/components/breadcrumb";
import {
  LayoutDashboard,
  FileText,
  Image,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Overview", icon: <LayoutDashboard /> },
  { href: "/dashboard/content", label: "Content", icon: <FileText /> },
  // eslint-disable-next-line jsx-a11y/alt-text
  { href: "/dashboard/media", label: "Media Library", icon: <Image /> },
  { href: "/dashboard/users", label: "Users", icon: <Users /> },
  { href: "/dashboard/settings", label: "Settings", icon: <Settings /> },
];

export function DashboardClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getPageTitle = () => {
    // For specific pages, return their exact titles
    if (pathname === "/dashboard") return "Overview";
    if (pathname === "/dashboard/profile") return "Profile";
    if (pathname === "/dashboard/settings") return "Settings";

    // For other pages, get from navLinks
    const currentLink = navLinks.find((link) => pathname.startsWith(link.href));
    return currentLink ? currentLink.label : "Dashboard";
  };

  const renderBreadcrumbs = () => {
    // Create breadcrumb items based on the current path
    const breadcrumbItems = [];

    // Add Dashboard as the root item
    breadcrumbItems.push({ label: "Dashboard", href: "/dashboard" });

    // Add other segments based on pathname
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 1) { // Skip "dashboard" which is already added
      const pageName = getPageTitle();
      breadcrumbItems.push({ label: pageName });
    }

    return (
      <div className="mb-2">
        <Breadcrumb items={breadcrumbItems} />
        <h2 className={styles.pageTitle}>{getPageTitle()}</h2>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className={styles.dashboardContainer}>
        <button
          className={styles.mobileMenuToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 12H21M3 6H21M3 18H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <aside
          className={`${styles.sidebar} ${
            mobileMenuOpen ? styles.sidebarOpen : ""
          }`}
        >
          <div className={styles.sidebarHeader}>
            <h1 className={styles.logo}>MedAI CMS</h1>
          </div>

          <nav className={styles.navigation}>
            <ul>
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(link.href);

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`${styles.navLink} ${
                        isActive ? styles.active : ""
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className={styles.navIcon}>{link.icon}</span>
                      <span className={styles.navText}>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.sidebarFooter}>
            <button className={styles.logoutButton} onClick={handleLogout}>
              <span className={styles.navIcon}>
                <LogOut />
              </span>
              <span className={styles.navText}>Logout</span>
            </button>
          </div>
        </aside>

        <main className={styles.mainContent}>
          <header className={styles.header}>
            <div className={styles.headerContent}>
              {renderBreadcrumbs()}

              <div className={styles.userInfo}>
                <ModeToggle />
                <UserAvatar />
              </div>
            </div>
          </header>

          <div className={styles.contentWrapper}>{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
