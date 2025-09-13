"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import styles from './createcourse.module.css';
import { Save, SquareArrowOutUpRight, MonitorStop, TabletSmartphone, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// Import tab content components
import CourseStructure from "./coursestructure";
import CourseSettings from "./coursesettings";
import CoursePrice from "./courseprice";
import Seo from "./courseseo";
import RecommendedCourses from "./recommendedcourses";
import Patrons from "./coursepatrons";
import Logs from "./courselogs";


const tabList = [
  { value: "courseStructure", label: "Course Structure", Component: CourseStructure, path: "courseStructure" },
  { value: "courseSettings", label: "Course Settings", Component: CourseSettings, path: "courseSettings" },
  { value: "coursePrice", label: "Course Price", Component: CoursePrice, path: "coursePrice" },
  { value: "seo", label: "SEO", Component: Seo, path: "seo" },
  { value: "recommendedCourses", label: "Recommended Courses", Component: RecommendedCourses, path: "recommendedCourses" },
  { value: "patrons", label: "Patrons", Component: Patrons, path: "patrons" },
  { value: "logs", label: "Logs", Component: Logs, path: "logs" },
];
export default function CreateCourse() {
  const router = useRouter();
  const pathname = usePathname();
  // Extract tab from path: /dashboard/courses/[tab]
  const pathSegments = pathname.split("/");
  const tabSegment = pathSegments[pathSegments.length - 1] || "courseStructure";
  const [activeTab, setActiveTab] = useState(tabSegment);
  const validTabs = ["courseStructure", "courseSettings", "coursePrice", "seo", "recommendedCourses", "patrons", "logs"];

  useEffect(() => {
    // Ensure we have a valid tab, default to courseStructure
    const currentTab = validTabs.includes(tabSegment) ? tabSegment : "courseStructure";
    setActiveTab(currentTab);
    
    // If current URL doesn't have a valid tab, redirect to courseStructure
    if (!validTabs.includes(tabSegment) && pathname.includes('/dashboard/courses/')) {
      router.replace('/dashboard/courses/courseStructure');
    }
  }, [tabSegment, pathname, router]);

  const handleTabChange = (value: string) => {
    router.push(`/dashboard/courses/${value}`);
    setActiveTab(value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Artificial Intelligence Based Cardiovascular</h1>
        </div>
        <div className={styles.courseSectionButtons} >
          <Button variant='glass' title="Update the Kite ID"><RefreshCcw /></Button>
          <Button variant='glass' title="Preview on Desktop"><MonitorStop /></Button>
          <Button variant='glass' title="Preview on Mobile"><TabletSmartphone /></Button>
          <Button variant='glass' title="Draft Changes"><Save /></Button>
          <Button variant='glass' title="Publish Course"><SquareArrowOutUpRight /></Button>
        </div>
      </div>
      <div className={styles.row}>
        <Tabs value={activeTab} onValueChange={handleTabChange} className={styles.tabs}>
          <TabsList className={styles.tabsList}>
            {tabList.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>
          {tabList.map(tab => (
            <TabsContent key={tab.value} value={tab.value}>
              <div className={styles.tabContent}>
                <tab.Component />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}