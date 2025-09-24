"use client";
import { useState, useEffect } from "react";
import { getCourses } from "@/lib/courses-api";
import { Course } from "@/types/course";
import { getCoursesCategory } from "@/lib/coursecategory-api";
import { CourseCategory } from "@/types/coursecategory";
import { getCoursesType } from "@/lib/coursetype-api";
import { CourseType } from "@/types/coursetype";
import { CoursePricing } from "@/types/course-pricing";
import { getCoursePricing } from "@/lib/courseprice-api";
import { PageLoading } from "@/components/ui/loading-spinner";
import { CourseFilters } from "./components/CourseFilters";
import { CourseList } from "./components/CourseList";
import { useCoursesFilter, useSortedCourses } from "./hooks/useCourseFilters";

export default function Courses() {
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [view, setView] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [sortByOption, setSortByOption] = useState("Newest");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [tableSortConfig, setTableSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [courseCategoryList, setCourseCategoryList] = useState<CourseCategory[]>([]);
  const [courseTypeList, setCourseTypeList] = useState<CourseType[]>([]);
  const [pricingMap, setPricingMap] = useState<Record<string, CoursePricing[]>>({});

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courses = await getCourses();
        setCoursesList(courses);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    const loadCourseCategories = async () => {
      try {
        const categories = await getCoursesCategory();
        setCourseCategoryList(categories.filter(c => c.status === 1));
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCourseCategories();
  }, []);

  useEffect(() => {
    const loadCourseType = async () => {
      try {
        const coursetype = await getCoursesType();
        setCourseTypeList(coursetype.filter(c => c.status === 1));
      } catch (error) {
        console.error('Failed to load coursetype:', error);
      }
    };
    loadCourseType();
  }, []);

  useEffect(() => {
    const fetchAllPricing = async () => {
      try {
        // Fetch in parallel for performance
        const entries = await Promise.all(
          coursesList.map(async (course) => {
            try {
              const prices = await getCoursePricing(course.uuid);
              return [course.id.toString(), prices] as const; // key by numeric id as string
            } catch (e) {
              console.error(`Pricing fetch failed for course ${course.id}/${course.uuid}:`, e);
              return [course.id.toString(), [] as CoursePricing[]] as const;
            }
          })
        );

        const map = Object.fromEntries(entries) as Record<string, CoursePricing[]>;
        setPricingMap(map);
        // Optional: compact log for verification
        // console.log('Pricing Map built:', map);
      } catch (error) {
        console.error("Error fetching pricing:", error);
      }
    };

    if (coursesList.length > 0) {
      fetchAllPricing();
    }

  }, [coursesList]);

  // Use our custom hooks for filtering and sorting
  const filteredCourses = useCoursesFilter({
    courses: coursesList,
    searchQuery,
    selectedCourse,
    selectedCategory,
    selectedCourseType,
    sortByOption
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  // Use our custom hook for table sorting
  const sortedCurrentCourses = useSortedCourses({
    courses: currentCourses,
    tableSortConfig
  });

  const handlePageChange = (url: string, page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCourse, selectedCategory, selectedCourseType, sortByOption, view]);

  const handleTableSort = (accessor: string, direction: 'asc' | 'desc') => {
    setTableSortConfig({ key: accessor, direction });
  };

  if (loading) {
    return <PageLoading message="Loading courses..." />;
  }

  return (
    <div className="relative">
      {/* Filter Bar Component */}
      <CourseFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedCourseType={selectedCourseType}
        setSelectedCourseType={setSelectedCourseType}
        sortByOption={sortByOption}
        setSortByOption={setSortByOption}
        view={view}
        setView={setView}
        courseCategoryList={courseCategoryList}
        courseTypeList={courseTypeList}
        coursesList={coursesList}
        courseCount={filteredCourses.length}
      />

      {/* Course Content */}
      <div className="shadow-sm p-6 bg-white rounded-lg mt-4">
        <CourseList
          view={view}
          courses={view === "list" ? sortedCurrentCourses : currentCourses}
          courseCategoryList={courseCategoryList}
          courseTypeList={courseTypeList}
          pricingMap={pricingMap}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCourses={filteredCourses.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onTableSort={handleTableSort}
        />
      </div>
    </div>
  );
}