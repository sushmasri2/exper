"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import styles from './createcourse.module.css';
import { Save, SquareArrowOutUpRight, MonitorStop, TabletSmartphone, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Course } from "@/types/course";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

// Import tab content components
import CourseStructure from "./coursestructure";
import CourseSettings from "./coursesettings";
import CoursePrice from "./courseprice";
import Seo from "./courseseo";
import RecommendedCourses from "./recommendedcourses";
import Patrons from "./coursepatrons";
import Logs from "./courselogs";


const tabList = [
  { value: "coursestructure", label: "Course Structure", Component: CourseStructure, path: "coursestructure" },
  { value: "coursesettings", label: "Course Settings", Component: CourseSettings, path: "coursesettings" },
  { value: "courseprice", label: "Course Price", Component: CoursePrice, path: "courseprice" },
  { value: "seo", label: "SEO", Component: Seo, path: "seo" },
  { value: "recommendedcourses", label: "Recommended Courses", Component: RecommendedCourses, path: "recommendedcourses" },
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
  const validTabs = ["coursestructure", "coursesettings", "courseprice", "seo", "recommendedcourses", "patrons", "logs"];

  const [courseData, setCourseData] = useState<Course | null>(null);
  const searchParams = useSearchParams();
  const courseId = searchParams.get('id');


  useEffect(() => {
    const currentTab = validTabs.includes(tabSegment) ? tabSegment : "coursestructure";
    setActiveTab(currentTab);

    if (!validTabs.includes(tabSegment) && pathname.includes('/dashboard/courses/')) {
      const redirectUrl = courseId
        ? `/dashboard/courses/coursestructure?id=${courseId}`
        : '/dashboard/courses/coursestructure';
      router.replace(redirectUrl);
    }
  }, [tabSegment, pathname, router, courseId]);
  useEffect(() => {
    if (!courseId) return;

    async function fetchCourse() {
      try {
        const res = await fetch(`/api/courses/${courseId}`);

        if (!res.ok) {
          throw new Error('Failed to fetch course');
        }

        const response = await res.json();

        if (response.success && response.data) {

          setCourseData(response.data);
        } else {
          console.error('API response structure issue:', response);
          throw new Error(response.message || 'Course not found');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    }

    fetchCourse();
  }, [courseId]);



  const handleTabChange = (value: string) => {
    const newUrl = courseId
      ? `/dashboard/courses/${value}?id=${courseId}`
      : `/dashboard/courses/${value}`;
    router.push(newUrl);
    setActiveTab(value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>{courseData?.course_name || "New Course"}</h1>
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