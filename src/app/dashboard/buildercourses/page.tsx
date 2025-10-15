"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPaginatedCourses } from "@/lib/courses-api";
import { PaginatedCoursesResponse, CoursesFilterParams } from "@/types/course";
import { getCoursesCategory } from "@/lib/coursecategory-api";
import { getCoursesType } from "@/lib/coursetype-api";
import { CourseCategory } from "@/types/coursecategory";
import { CourseType } from "@/types/coursetype";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select2 from "@/components/ui/Select2";
import { Search, RefreshCw } from "lucide-react";
import { PageLoading } from "@/components/ui/loading-spinner";
import { CourseListView } from "./components/CourseListView";
import Pagination2 from "@/components/ui/pagination2";
import { useApiCache } from "@/hooks/use-api-cache";
import { setGlobalCacheInstance } from "@/lib/cache-utils";

function BuilderCoursesContent() {
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

    setSearchQuery(search);
    setSelectedCategory(category);
    setSelectedCourseType(courseType);
  }, [searchParams]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load dropdowns data with caching
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

      const filterParams: CoursesFilterParams = {
        page: currentPage,
        limit: 5,
        search: search || undefined,
        category: category || undefined,
        courseType: courseType || undefined,
        ...params
      };

      // Create cache key based on params
      const cacheKey = `paginated-courses-${JSON.stringify(filterParams)}`;

      const response = await cachedApiCall(
        () => getPaginatedCourses(filterParams),
        { cacheKey }
      );
      console.log('Fetched paginated courses:', response);

      setCoursesData(response);
    } catch (error) {
      console.error('Failed to load courses:', error);
      setCoursesData(null);
    } finally {
      setSearchLoading(false);
    }
  }, [searchParams, cachedApiCall]);

  // Load courses when URL params change
  useEffect(() => {
    if (!loading) {
      loadCourses();
    }
  }, [loadCourses, loading]);

  // Update URL with current filters
  const updateURL = (params: Record<string, string>) => {
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

    router.push(`/dashboard/buildercourses?${newSearchParams.toString()}`);
  };

  // Search handler
  const handleSearch = () => {
    updateURL({
      search: searchQuery,
      category: selectedCategory,
      courseType: selectedCourseType
    });
  };

  // Reset handler
  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedCourseType("");
    router.push('/dashboard/buildercourses');
  };

  // Pagination handler
  const handlePageChange = (url: string, page: number) => {
    updateURL({ page: page.toString() });
  };

  // Table sort handler
  const handleTableSort = (accessor: string, direction: 'asc' | 'desc') => {
    // TODO: Implement sorting functionality
    console.log('Sort by:', accessor, direction);
  };

  // Course deleted handler
  const handleCourseDeleted = async () => {
    // Invalidate courses cache and reload
    invalidateRelatedCache('courses');
    await loadCourses();
  };

  // Handle Enter key in search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen bg-background" style={{
      margin: '-1rem',
      padding: '0'
    }}>
      {/* Header and Filters */}
      <div className="top-0 z-[15] bg-background/95 shadow-sm border-b backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-foreground">
              Builder Courses
              {coursesData && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({coursesData.pagination.total} total)
                </span>
              )}
            </h1>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search Input */}
            <div className="flex-1 min-w-[300px]">
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>

            {/* Category Dropdown */}
            <div className="min-w-[200px]">
              <Select2
                options={[
                  { label: 'All Categories', value: '' },
                  ...courseCategoryList.map(cat => ({
                    label: cat.name,
                    value: cat.id.toString()
                  }))
                ]}
                value={selectedCategory}
                onChange={(val) => {
                  if (typeof val === 'string') setSelectedCategory(val);
                }}
                placeholder="Select Category"
              />
            </div>

            {/* Course Type Dropdown */}
            <div className="min-w-[200px]">
              <Select2
                options={[
                  { label: 'All Course Types', value: '' },
                  ...courseTypeList.map(type => ({
                    label: type.name,
                    value: type.id.toString()
                  }))
                ]}
                value={selectedCourseType}
                onChange={(val) => {
                  if (typeof val === 'string') setSelectedCourseType(val);
                }}
                placeholder="Select Course Type"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSearch}
                disabled={searchLoading}
                className="flex items-center gap-2 !bg-blue-600 hover:!bg-blue-700 !text-white shadow-sm"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
              <Button
                variant="destructive"
                onClick={handleReset}
                disabled={searchLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {searchLoading ? (
          <div className="flex items-center justify-center py-8">
            <PageLoading />
          </div>
        ) : coursesData && coursesData.data.length > 0 ? (
          <>
            {/* Course List */}
            <div className="bg-card rounded-lg shadow-sm border">
              <CourseListView
                courses={coursesData.data}
                onSort={handleTableSort}
                onCourseDeleted={handleCourseDeleted}
              />
            </div>

            {/* Pagination */}
            {coursesData.pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination2
                  pagination={coursesData.pagination}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className="bg-card rounded-lg shadow-sm border p-8">
            <div className="text-center">
              <div className="text-muted-foreground mb-2">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No courses found
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory || selectedCourseType
                  ? "Try adjusting your filters or search terms."
                  : "No courses available at the moment."
                }
              </p>
              {(searchQuery || selectedCategory || selectedCourseType) && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BuilderCourses() {
  return (
    <div style={{
      margin: '-1rem',
      padding: '0',
      width: 'calc(100% + 2rem)',
      minHeight: '100vh'
    }}>
      <Suspense fallback={<PageLoading />}>
        <BuilderCoursesContent />
      </Suspense>
    </div>
  );
}