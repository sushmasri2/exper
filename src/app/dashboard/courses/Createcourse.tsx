"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import styles from './createcourse.module.css';
import { Save, SquareArrowOutUpRight, MonitorStop, TabletSmartphone, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// Import tab content components
import CourseStructure from "./coursestructure/page";
import CourseSettings from "./coursesettings/page";
import CoursePrice from "./courseprice/page";
import Seo from "./seo/page";
import RecommendedCourses from "./recommendedcourses/page";
import Patrons from "./patrons/page";
import Logs from "./logs/page";

interface CreateCourseProps {
  courseSlug?: string;
}

const tabList = [
  { value: "CourseStructure", label: "Course Structure", Component: CourseStructure, path: "courseStructure" },
  { value: "courseSettings", label: "Course Settings", Component: CourseSettings, path: "courseSettings" },
  { value: "coursePrice", label: "Course Price", Component: CoursePrice, path: "coursePrice" },
  { value: "seo", label: "SEO", Component: Seo, path: "seo" },
  { value: "recommendedCourses", label: "Recommended Courses", Component: RecommendedCourses, path: "recommendedCourses" },
  { value: "patrons", label: "Patrons", Component: Patrons, path: "patrons" },
  { value: "logs", label: "Logs", Component: Logs, path: "logs" },
];

export default function CreateCourse({ courseSlug }: CreateCourseProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const pathSegments = pathname.split("/");
  const tabSegment = pathSegments[pathSegments.length - 1] || "courseStructure";
  const [activeTab, setActiveTab] = useState(tabSegment);

  // Convert slug back to readable title
  const courseTitle = courseSlug 
    ? courseSlug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    : "New Course";
    console.log("Course Title:", courseTitle);

  useEffect(() => {
    setActiveTab(tabSegment);
  }, [tabSegment]);

  const handleTabChange = (value: string) => {
    if (courseSlug) {
      router.push(`/dashboard/courses/courseStructure/${courseSlug}/${value}`);
    } else {
      router.push(`/dashboard/courses/${value}`);
    }
    setActiveTab(value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>{courseTitle}</h1>
        </div>
        <div className={styles.courseSectionButtons}>
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