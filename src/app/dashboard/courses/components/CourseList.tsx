"use client";

import { Course } from "@/types/course";
import { CourseGridCard } from "./CourseGridCard";
import { CourseTableView } from "./CourseTableView";
import { CourseCategory } from "@/types/coursecategory";
import { CourseType } from "@/types/coursetype";
import { CoursePricing } from "@/types/course-pricing";
import Pagination from "@/components/ui/pagination";

interface CourseListProps {
  view: string;
  courses: Course[];
  courseCategoryList: CourseCategory[];
  courseTypeList: CourseType[];
  pricingMap: Record<string, CoursePricing[]>;
  currentPage: number;
  totalPages: number;
  totalCourses: number;
  itemsPerPage: number;
  onPageChange: (url: string, page: number) => void;
  onTableSort: (accessor: string, direction: 'asc' | 'desc') => void;
}

export function CourseList({
  view,
  courses,
  courseCategoryList,
  courseTypeList,
  pricingMap,
  currentPage,
  totalPages,
  totalCourses,
  itemsPerPage,
  onPageChange,
  onTableSort
}: CourseListProps) {
  const paginationData = {
    total: totalCourses,
    totalPages,
    page: currentPage,
    limit: itemsPerPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    links: {
      next: `?page=${currentPage + 1}`,
      prev: `?page=${currentPage - 1}`,
      first: `?page=1`,
      last: `?page=${totalPages}`
    }
  };

  if (courses.length === 0) {
    return <p className="text-gray-500">No courses found.</p>;
  }

  return (
    <>
      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseGridCard
              key={course.id}
              course={course}
              courseCategoryList={courseCategoryList}
              courseTypeList={courseTypeList}
              pricingMap={pricingMap}
            />
          ))}
        </div>
      ) : (
        <CourseTableView
          courses={courses}
          courseCategoryList={courseCategoryList}
          courseTypeList={courseTypeList}
          pricingMap={pricingMap}
          onSort={onTableSort}
        />
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            pagination={paginationData}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}