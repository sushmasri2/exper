"use client";
import { useState, useEffect } from "react";
import { getCourses } from "@/lib/courses-api";
import { Course } from "@/types/course";
import { getCoursesCategory } from "@/lib/coursecategory-api";
import { CourseCategory } from "@/types/coursecategory";
import { getCoursesType } from "@/lib/coursetype-api";
import { CourseType } from "@/types/coursetype";
import { PageLoading } from "@/components/ui/loading-spinner";
import { CourseFilters } from "./components/CourseFilters";
import { CourseList } from "./components/CourseList";
import { useCoursesFilter, useSortedCourses } from "./hooks/useCourseFilters";
import { useApiCache } from "@/hooks/use-api-cache";
import { setGlobalCacheInstance } from "@/lib/cache-utils";

export default function Courses() {
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [view, setView] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [sortByOption, setSortByOption] = useState("Newest");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [tableSortConfig, setTableSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [courseCategoryList, setCourseCategoryList] = useState<CourseCategory[]>([]);
  const [courseTypeList, setCourseTypeList] = useState<CourseType[]>([]);

  const cacheInstance = useApiCache();
  const { cachedApiCall, invalidateRelatedCache } = cacheInstance;

  // Set global cache instance for API functions to use
  setGlobalCacheInstance(cacheInstance);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        // Load all data concurrently with caching to prevent duplicate requests
        const [courses, categories, courseTypes] = await Promise.all([
          cachedApiCall(() => getCourses(), { cacheKey: 'courses' }),
          cachedApiCall(() => getCoursesCategory(), { cacheKey: 'categories' }),
          cachedApiCall(() => getCoursesType(), { cacheKey: 'course-types' })
        ]);

        // Set all data
        setCoursesList(courses);
        setCourseCategoryList(categories.filter(c => c.status === 1));
        setCourseTypeList(courseTypes.filter(c => c.status === 1));
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [cachedApiCall]);

  // Use our custom hooks for filtering and sorting
  const filteredCourses = useCoursesFilter({
    courses: coursesList,
    searchQuery,
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
  }, [searchQuery, selectedCategory, selectedCourseType, sortByOption, view]);

  const handleTableSort = (accessor: string, direction: 'asc' | 'desc') => {
    setTableSortConfig({ key: accessor, direction });
  };

  const handleCourseDeleted = async () => {
    // Reload courses after deletion
    try {
      // Invalidate courses cache and fetch fresh data
      invalidateRelatedCache('courses');
      const courses = await cachedApiCall(() => getCourses(), { cacheKey: 'courses' });
      setCoursesList(courses);
      // Reset to first page if current page becomes empty
      const newTotalPages = Math.ceil(courses.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Failed to reload courses after deletion:', error);
    }
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
        courseCount={filteredCourses.length}
      />

      {/* Course Content */}
      <div className="shadow-sm p-6 bg-white rounded-lg mt-4">
        <CourseList
          view={view}
          courses={view === "list" ? sortedCurrentCourses : currentCourses}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCourses={filteredCourses.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onTableSort={handleTableSort}
          onCourseDeleted={handleCourseDeleted}
        />
      </div>
    </div>
  );
}