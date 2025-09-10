"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import styles from './coursepage.module.css';
import { Save, SquareArrowOutUpRight, MonitorStop, TabletSmartphone, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// Import tab content components
import CourseBuilder from "./CourseBuilder";
import CourseSettings from "./CourseSettings";
import CoursePrice from "./CoursePrice";
import Seo from "./Seo";
import RecommendedCourses from "./RecommendedCourses";
import Patrons from "./Patrons";
import Logs from "./Logs";


const tabList = [
  { value: "courseBuilder", label: "Course Builder", Component: CourseBuilder, path: "courseBuilder" },
  { value: "courseSettings", label: "Course Settings", Component: CourseSettings, path: "courseSettings" },
  { value: "coursePrice", label: "Course Price", Component: CoursePrice, path: "coursePrice" },
  { value: "seo", label: "SEO", Component: Seo, path: "seo" },
  { value: "recommendedCourses", label: "Recommended Courses", Component: RecommendedCourses, path: "recommendedCourses" },
  { value: "patrons", label: "Patrons", Component: Patrons, path: "patrons" },
  { value: "logs", label: "Logs", Component: Logs, path: "logs" },
];
export default function createCourse() {
  const router = useRouter();
  const pathname = usePathname();
  // Extract tab from path: /dashboard/courses/[tab]
  const pathSegments = pathname.split("/");
  const tabSegment = pathSegments[3] || "courseBuilder";
  const [activeTab, setActiveTab] = useState(tabSegment);

  useEffect(() => {
    setActiveTab(tabSegment);
  }, [tabSegment]);

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