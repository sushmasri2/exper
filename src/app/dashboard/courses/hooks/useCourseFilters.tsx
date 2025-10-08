"use client";

import { useMemo } from "react";
import { Course } from "@/types/course";

interface UseCourseFilterProps {
  courses: Course[];
  searchQuery: string;
  selectedCategory: string;
  selectedCourseType: string;
  sortByOption: string;
}

export function useCoursesFilter({
  courses,
  searchQuery,
  selectedCategory,
  selectedCourseType,
  sortByOption
}: UseCourseFilterProps) {
  return useMemo(() => {
    let result = [...courses];

    // Search filter
    if (searchQuery) {
      result = result.filter((c) =>
        c.course_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((c) => c.category_id.toString() === selectedCategory);
    }

    // Course Type filter
    if (selectedCourseType) {
      result = result.filter((c) => c.course_type_id.toString() === selectedCourseType);
    }

    // Sorting (only for grid view)
    if (sortByOption === "A-Z") {
      result.sort((a, b) => a.course_name.localeCompare(b.course_name));
    } else if (sortByOption === "Z-A") {
      result.sort((a, b) => b.course_name.localeCompare(a.course_name));
    } else if (sortByOption === "newest") {
      result.sort((a, b) => b.id - a.id);  // Higher ID = newer
    } else if (sortByOption === "oldest") {
      result.sort((a, b) => a.id - b.id);  // Lower ID = older
    }
    return result;
  }, [courses, searchQuery, selectedCategory, selectedCourseType, sortByOption]);
}

interface UseSortedCoursesProps {
  courses: Course[];
  tableSortConfig: { key: string, direction: 'asc' | 'desc' } | null;
}

export function useSortedCourses({
  courses,
  tableSortConfig
}: UseSortedCoursesProps) {
  return useMemo(() => {
    if (!tableSortConfig) return courses;

    return [...courses].sort((a, b) => {
      const key = tableSortConfig.key as keyof typeof a;
      const aVal = a[key];
      const bVal = b[key];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return tableSortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return tableSortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [courses, tableSortConfig]);
}