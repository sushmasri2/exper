"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import styles from './createcourse.module.css';
import { MonitorStop, TabletSmartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Course } from "@/types/course";
import { GetCourseById } from "@/lib/courses-api";
import { useApiCache } from "@/hooks/use-api-cache";
import { setGlobalCacheInstance } from "@/lib/cache-utils";

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
const validTabs = ["coursestructure", "coursesettings", "courseprice", "seo", "recommendedcourses", "patrons", "logs"];

export default function CreateCourse() {
  const router = useRouter();
  const pathname = usePathname();
  const cacheInstance = useApiCache();
  const { cachedApiCall, invalidateCache } = cacheInstance;

  // Set global cache instance for API functions to use
  setGlobalCacheInstance(cacheInstance);

  // Extract tab from path: /dashboard/courses/[tab]
  const pathSegments = pathname.split("/");
  const tabSegment = pathSegments[pathSegments.length - 1] || "courseStructure";
  const [activeTab, setActiveTab] = useState(tabSegment);

  const [courseData, setCourseData] = useState<Course | null>(null);
  const [lastCourseId, setLastCourseId] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const courseId = Number(searchParams.get("id") ?? 0);

  useEffect(() => {
    setActiveTab(tabSegment);

    if (!validTabs.includes(tabSegment) && pathname.includes('/dashboard/courses/')) {
      const redirectUrl = courseId
        ? `/dashboard/courses/coursestructure?id=${courseId}`
        : '/dashboard/courses/coursestructure';
      router.replace(redirectUrl);
    }
    // validTabs is defined outside the component and doesn't change, so it can be safely omitted
  }, [tabSegment, pathname, router, courseId]);

  useEffect(() => {
    if (!courseId) {
      console.log("No courseId provided");
      setCourseData(null);
      setLastCourseId(null);
      return;
    }

    console.log(`Fetching course data for ID: ${courseId}`);

    const fetchCourseData = async () => {
      try {
        // If this is a different course ID than the last one, it might be a newly created course
        // Force invalidate cache for this specific course to ensure fresh data
        if (lastCourseId !== courseId) {
          console.log(`Course ID changed from ${lastCourseId} to ${courseId}, invalidating cache`);
          invalidateCache(`course-${courseId}`);
          invalidateCache('courses'); // Also invalidate courses list cache
        }

        // Use the new GetCourseById function that handles UUID/ID fallback internally
        const course = await cachedApiCall(() => GetCourseById(courseId), { 
          cacheKey: `course-${courseId}`,
          ttl: 5000 // Shorter TTL for individual courses to ensure fresh data
        });
        
        if (course) {
          console.log("Successfully fetched course:", course);
          setCourseData(course);
          setLastCourseId(courseId);
        } else {
          console.log("Course not found");
          setCourseData(null);
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
        setCourseData(null);
      }
    };

    fetchCourseData();
  }, [courseId, cachedApiCall, invalidateCache, lastCourseId]);
  const handleTabChange = (value: string) => {
    let newUrl;
    if (courseId) {
      // Support both formats
      newUrl = `/dashboard/courses/${value}?id=${courseId}`;
    } else {
      newUrl = `/dashboard/courses/${value}`;
    }
    router.push(newUrl);
    setActiveTab(value);
  };

  // if (loading) {
  //   return <div>Loading course data...</div>;
  // }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>{courseData?.course_name || "New Course"}</h1>
        </div>
        <div className={styles.courseSectionButtons} >
          <Button variant='glass' title="Preview on Desktop"><MonitorStop /></Button>
          <Button variant='glass' title="Preview on Mobile"><TabletSmartphone /></Button>
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
                <tab.Component courseData={courseData} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}