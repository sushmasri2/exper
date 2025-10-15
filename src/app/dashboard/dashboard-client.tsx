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
  Book,
  BriefcaseMedical,
  ComponentIcon,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  SquareDashedKanbanIcon,
  BookOpenCheck,
  TicketCheck,
  CloudCheck,
  Building,
  Tag,
  ShieldBan,
  CardSim,
  ShieldQuestionMark,
  GraduationCap,
  MessagesSquare,
  MapPin,
  ChartCandlestick,
  ClipboardPlus,
  Handshake
} from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Overview", icon: <LayoutDashboard /> },
  { href: "/dashboard/courses", label: "Courses", icon: <Book /> },
  { href: "/dashboard/buildercourses", label: "Courses Builder", icon: <Building /> },
  { href: "/dashboard/categories", label: "Courses Categories", icon: <Tag /> },
  {
    href: "/dashboard/activities", label: "Activities", icon: <SquareDashedKanbanIcon />,
    children: [
      { href: "/dashboard/activities/assessments", label: "Assessments", icon: <BookOpenCheck /> },
      { href: "/dashboard/activities/certificates", label: "Certificates", icon: <TicketCheck /> },
      { href: "/dashboard/activities/discussionforum", label: "Discussion Forum", icon: <MessagesSquare /> },
    ]
  },
  { href: "/dashboard/cases", label: "Cases", icon: <BriefcaseMedical /> },
  { href: "/dashboard/coupon", label: "Coupon Code", icon: <ComponentIcon /> },
  { href: "/dashboard/partners", label: "Our Partners", icon: <Handshake /> },
  { href: "/dashboard/successstories", label: "Success Stories", icon: <CloudCheck /> },
  {
    href: "/dashboard/settings/general", label: "Settings", icon: <Settings />,
    children: [
      { href: "/dashboard/settings/general", label: "General", icon: <BookOpenCheck /> },
      { href: "/dashboard/settings/coursetype", label: "Course Type", icon: <GraduationCap /> },
      { href: "/dashboard/settings/eligibility", label: "Eligibility", icon: <ShieldBan /> },
      { href: "/dashboard/settings/lti", label: "LTI Provider", icon: <CardSim /> },
      { href: "/dashboard/settings/faq", label: "Course FAQ", icon: <ShieldQuestionMark /> },
      { href: "/dashboard/settings/region", label: "Region", icon: <MapPin /> },
      { href: "/dashboard/settings/currency", label: "Currency", icon: <ChartCandlestick /> },
      { href: "/dashboard/settings/specialities", label: "Specialities", icon: <ClipboardPlus /> },
    ]
  },
];

export function DashboardClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleDropdown = (href: string) => {
    setOpenDropdowns(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const getPageTitle = () => {
    // For specific pages, return their exact titles
    if (pathname.startsWith('/dashboard/courses/') && pathname !== '/dashboard/courses') {
      return "Course";
    }
    if (pathname === "/dashboard") return "Overview";
    if (pathname.startsWith("/dashboard/buildercourses")) return "Courses Builder";
    if (pathname.startsWith("/dashboard/courses")) return "Courses";
    if (pathname.startsWith("/dashboard/categories")) return "Courses Categories";
    if (pathname === "/dashboard/activities/assessments") return "Assessments";
    if (pathname === "/dashboard/activities/certificates") return "Certificates";
    if (pathname === "/dashboard/activities/discussionforum") return "Discussion Forum";
    if (pathname === "/dashboard/cases") return "Cases";
    if (pathname === "/dashboard/coupon") return "Coupon Code";
    if (pathname === "/dashboard/partners") return "Our Partners";
    if (pathname.startsWith("/dashboard/partners/")) return "Our Partners";
    if (pathname === "/dashboard/settings/general") return "Settings";
    if (pathname === "/dashboard/settings/eligibility") return "Eligibility ";
    if (pathname === "/dashboard/settings/coursetype") return "Course Type";
    if (pathname === "/dashboard/settings/lti") return "LTI Provider ";
    if (pathname === "/dashboard/settings/faq") return "Course FAQ";
    if (pathname === "/dashboard/settings/region") return "Region";
    if (pathname === "/dashboard/settings/currency") return "Currency";
    if (pathname === "/dashboard/settings/specialities") return "Specialities";

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
          className={`${styles.sidebar} ${mobileMenuOpen ? styles.sidebarOpen : ""
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

                const isDropdownOpen = openDropdowns.includes(link.href);
                const hasChildren = link.children && link.children.length > 0;

                return (
                  <li key={link.href}>
                    {hasChildren ? (
                      <>
                        <div
                          className={`${styles.navLink} ${isActive ? styles.active : ""
                            } ${styles.dropdownTrigger}`}
                          onClick={() => toggleDropdown(link.href)}
                        >
                          <span className={styles.navIcon}>{link.icon}</span>
                          <span className={styles.navText}>{link.label}</span>
                          <span className={styles.chevronIcon}>
                            {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        </div>
                        {isDropdownOpen && (
                          <ul className={styles.dropdown}>
                            {link.children.map((child) => {
                              const isChildActive = pathname === child.href;
                              return (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    className={`${styles.navLink} ${styles.childNavLink} ${isChildActive ? styles.active : ""
                                      }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    <span className={styles.navIcon}>{child.icon}</span>
                                    <span className={styles.navText}>{child.label}</span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        href={link.href}
                        className={`${styles.navLink} ${isActive ? styles.active : ""
                          }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className={styles.navIcon}>{link.icon}</span>
                        <span className={styles.navText}>{link.label}</span>
                      </Link>
                    )}
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