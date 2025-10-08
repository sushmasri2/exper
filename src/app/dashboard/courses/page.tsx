"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPaginatedCourses } from "@/lib/courses-api";
import { PaginatedCoursesResponse, CoursesFilterParams } from "@/types/course";
import { getCoursesCategory } from "@/lib/coursecategory-api";
import { CourseCategory } from "@/types/coursecategory";
import { getCoursesType } from "@/lib/coursetype-api";
import { CourseType } from "@/types/coursetype";
import { PageLoading } from "@/components/ui/loading-spinner";
import { CourseFilters } from "./components/CourseFilters";
import { CourseList } from "./components/CourseList";
import { useApiCache } from "@/hooks/use-api-cache";
import { setGlobalCacheInstance } from "@/lib/cache-utils";

function CoursesContent() {
  // States
  const [coursesData, setCoursesData] = useState<PaginatedCoursesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [courseCategoryList, setCourseCategoryList] = useState<CourseCategory[]>([]);
  const [courseTypeList, setCourseTypeList] = useState<CourseType[]>([]);

  // Form states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCourseType, setSelectedCourseType] = useState("");
  const [sortByOption, setSortByOption] = useState("newest");
  const [view, setView] = useState("grid");
  const [itemsPerPage] = useState(6);
  const [tableSortConfig, setTableSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  // Navigation
  const router = useRouter();
  const searchParams = useSearchParams();

  // Cache
  const cacheInstance = useApiCache();
  const { cachedApiCall, invalidateRelatedCache } = cacheInstance;

  // Set global cache instance
  setGlobalCacheInstance(cacheInstance);

  // Initialize form values from URL params
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const courseType = searchParams.get('courseType') || '';
    const sortBy = searchParams.get('sortBy') || 'newest';
    const viewMode = searchParams.get('view') || 'grid';

    setSearchQuery(search);
    setSelectedCategory(category);
    setSelectedCourseType(courseType);
    setSortByOption(sortBy);
    setView(viewMode);
  }, [searchParams]);

  // Load initial data (dropdowns)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [categories, courseTypes] = await Promise.all([
          cachedApiCall(() => getCoursesCategory(), { cacheKey: 'categories' }),
          cachedApiCall(() => getCoursesType(), { cacheKey: 'course-types' })
        ]);

        setCourseCategoryList(categories.filter(c => c.status === 1));
        setCourseTypeList(courseTypes.filter(c => c.status === 1));
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [cachedApiCall]);

  // Load courses with filters
  const loadCourses = useCallback(async (params: CoursesFilterParams = {}) => {
    setSearchLoading(true);
    try {
      const currentPage = parseInt(searchParams.get('page') || '1');
      const search = searchParams.get('search') || '';
      const category = searchParams.get('category') || '';
      const courseType = searchParams.get('courseType') || '';
      const sortBy = searchParams.get('sortBy') || 'newest';

      const filterParams: CoursesFilterParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: search || undefined,
        category: category || undefined,
        courseType: courseType || undefined,
        sortBy: sortBy || undefined,
        ...params
      };

      const cacheKey = `paginated-courses-limit-${itemsPerPage}`;

      const response = await cachedApiCall(
        () => getPaginatedCourses(filterParams),
        { cacheKey }
      );
      console.log('Fetched paginated courses:', response);
      console.log('Filter params used:', filterParams);
      console.log('Current URL search params:', searchParams.toString());

      setCoursesData(response);
    } catch (error) {
      console.error('Failed to load courses:', error);
      setCoursesData(null);
    } finally {
      setSearchLoading(false);
    }
  }, [searchParams, cachedApiCall, itemsPerPage]);

  // Load courses when URL params change
  useEffect(() => {
    if (!loading) {
      loadCourses();
    }
  }, [loadCourses, loading]);

  // Update URL with current filters
  const updateURL = useCallback((params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value && value.trim()) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });

    // Always reset to page 1 when filters change (except when changing page)
    if (!params.page) {
      newSearchParams.delete('page');
    }

    const finalUrl = `/dashboard/courses?${newSearchParams.toString()}`;
    router.push(finalUrl);
  }, [searchParams, router]);

  // Handle filter changes
  const handleFiltersApply = useCallback(() => {
    const filterParams = {
      search: searchQuery,
      category: selectedCategory,
      courseType: selectedCourseType,
      sortBy: sortByOption,
      view: view
    };
    updateURL(filterParams);
  }, [searchQuery, selectedCategory, selectedCourseType, sortByOption, view, updateURL]);

  // Handle pagination
  const handlePageChange = (url: string, page: number) => {
    console.log('🔄 handlePageChange called:', { url, page });
    console.log('📄 Current searchParams:', searchParams.toString());
    
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('page', page.toString());
    const finalUrl = `/dashboard/courses?${newSearchParams.toString()}`;
    
    console.log('🎯 Navigating to:', finalUrl);
    router.push(finalUrl);
  };

  // Handle table sort
  const handleTableSort = (accessor: string, direction: 'asc' | 'desc') => {
    setTableSortConfig({ key: accessor, direction });
  };

  // Handle course deleted
  const handleCourseDeleted = async () => {
    invalidateRelatedCache('courses');
    await loadCourses();
  };

  // Auto-apply filters when they change (optional - remove if you want manual apply)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        console.log('⏰ Applying filters after debounce...');
        // Only apply if we're not just changing pages - check if current URL params match form state
        const currentSearch = searchParams.get('search') || '';
        const currentCategory = searchParams.get('category') || '';
        const currentCourseType = searchParams.get('courseType') || '';
        const currentSortBy = searchParams.get('sortBy') || 'newest';
        const currentView = searchParams.get('view') || 'grid';
        
        // Only apply filters if there's actually a change in filter values (not just page)
        if (searchQuery !== currentSearch || 
            selectedCategory !== currentCategory || 
            selectedCourseType !== currentCourseType || 
            sortByOption !== currentSortBy || 
            view !== currentView) {
          handleFiltersApply();
        }
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedCourseType, sortByOption, view, handleFiltersApply, loading, searchParams]);

  if (loading) {
    return <PageLoading message="Loading courses..." />;
  }

  // Get current courses for display
  const currentCourses = coursesData?.data || [];
  const totalPages = coursesData?.pagination.totalPages || 0;
  const currentPage = coursesData?.pagination.page || 1;
  const totalCourses = coursesData?.pagination.total || 0;

  // Apply client-side sorting based on sortByOption
  const applySortByOption = (courses: typeof currentCourses) => {
    if (!sortByOption || sortByOption === 'newest') return courses; // Default API order
    
    return [...courses].sort((a, b) => {
      switch (sortByOption) {
        case 'oldest':
          // Assume newest first by default, so reverse for oldest
          return a.id - b.id; // Lower ID = older
        case 'a-z':
          return a.course_name.toLowerCase().localeCompare(b.course_name.toLowerCase());
        case 'z-a':
          return b.course_name.toLowerCase().localeCompare(a.course_name.toLowerCase());
        default:
          return 0;
      }
    });
  };

  // Apply sortBy filter first
  const sortedCourses = applySortByOption(currentCourses);
  
  // Then apply client-side table sorting if in list view (this overrides sortBy when active)
  const finalSortedCourses = tableSortConfig && view === "list"
    ? [...sortedCourses].sort((a, b) => {
        const aValue = a[tableSortConfig.key as keyof typeof a];
        const bValue = b[tableSortConfig.key as keyof typeof b];
        
        if (aValue === undefined || aValue === null || bValue === undefined || bValue === null) return 0;
        
        if (tableSortConfig.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      })
    : sortedCourses;
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
        courseCount={totalCourses}
      />

      {/* Course Content */}
      <div className="shadow-sm p-6 bg-white rounded-lg mt-4">
        {searchLoading ? (
          <div className="flex items-center justify-center py-8">
            <PageLoading />
          </div>
        ) : (
          <CourseList
            view={view}
            courses={finalSortedCourses}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCourses={totalCourses}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onTableSort={handleTableSort}
            onCourseDeleted={handleCourseDeleted}
          />
        )}
      </div>
    </div>
  );
}

export default function Courses() {
  return (
    <Suspense fallback={<PageLoading message="Loading courses..." />}>
      <CoursesContent />
    </Suspense>
  );
}