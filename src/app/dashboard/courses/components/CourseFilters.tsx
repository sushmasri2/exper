"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select2 from "@/components/ui/Select2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Grid, List, Plus } from "lucide-react";
import Link from "next/link";
import { CourseCategory } from "@/types/coursecategory";
import { CourseType } from "@/types/coursetype";
import { Course } from "@/types/course";

interface CourseFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCourse: string;
  setSelectedCourse: (course: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedCourseType: string;
  setSelectedCourseType: (type: string) => void;
  sortByOption: string;
  setSortByOption: (option: string) => void;
  view: string;
  setView: (view: string) => void;
  courseCategoryList: CourseCategory[];
  courseTypeList: CourseType[];
  coursesList: Course[];
  courseCount: number;
}

const sortBy = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "A-Z", value: "a-z" },
  { label: "Z-A", value: "z-a" },
];

export function CourseFilters({
  searchQuery,
  setSearchQuery,
  selectedCourse,
  setSelectedCourse,
  selectedCategory,
  setSelectedCategory,
  selectedCourseType,
  setSelectedCourseType,
  sortByOption,
  setSortByOption,
  view,
  setView,
  courseCategoryList,
  courseTypeList,
  coursesList,
  courseCount
}: CourseFiltersProps) {
  return (
    <div className="sticky top-0 z-30 bg-white shadow-sm p-6 flex items-center justify-between gap-6" style={{ borderRadius: '0 0 1rem 1rem' }}>
      <div className="flex-shrink-0">
        <h1 className="text-lg font-medium text-gray-900 whitespace-nowrap">
          All Courses ({courseCount})
        </h1>
      </div>
      <div className="flex items-center gap-4 flex-1 max-w-4xl">
        <div className="flex-[3]">
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-full border-gray-300 w-full"
          />
        </div>
        <div className="flex-[4] min-w-[180px]">
          <Select2
            options={coursesList.length > 0 ? [{ label: 'Select Course', value: '' }, ...coursesList.map(course => ({ label: course.course_name, value: course.seo_url }))] : [{ label: 'Select Course', value: '' }]}
            value={selectedCourse === '' ? '' : coursesList.find(c => c.seo_url === selectedCourse)?.seo_url || ''}
            onChange={val => {
              if (typeof val === 'string') setSelectedCourse(val);
            }}
            placeholder="Select Course"
          />
        </div>
        <div className="flex-[4] min-w-[180px]">
          <Select2
            options={courseCategoryList.length > 0 ? [{ label: 'Select Category', value: '' }, ...courseCategoryList.map(cat => ({ label: cat.name, value: cat.id.toString() }))] : [{ label: 'Select Category', value: '' }]}
            value={selectedCategory}
            onChange={val => {
              if (typeof val === 'string') setSelectedCategory(val);
            }}
            placeholder="Select Category"
          />
        </div>
        <div className="flex-[4] min-w-[180px]">
          <Select2
            options={courseTypeList.length > 0 ? [{ label: 'Select Course Type', value: '' }, ...courseTypeList.map(type => ({ label: type.name, value: type.id.toString() }))] : [{ label: 'Select Course Type', value: '' }]}
            value={selectedCourseType}
            onChange={val => {
              if (typeof val === 'string') setSelectedCourseType(val);
            }}
            placeholder="Select Course Type"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex-[3] gap-2 rounded-lg border-gray-300 text-left justify-between"
            >
              <span className="truncate">{sortByOption}</span>
              <ChevronDown size={16} className="flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {sortBy.map((sortby) => (
              <DropdownMenuItem
                key={sortby.value}
                onClick={() => setSortByOption(sortby.label)}
              >
                {sortby.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link href="/dashboard/courses/coursestructure">
          <Button variant="courseCreate" className="whitespace-nowrap">
            <Plus size={16} /> Create New Course
          </Button>
        </Link>
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <Button
            variant={view === "grid" ? "courseCreate" : "default"}
            size="icon"
            onClick={() => setView("grid")}
          >
            <Grid size={16} />
          </Button>
          <Button
            variant={view === "list" ? "courseCreate" : "default"}
            size="icon"
            onClick={() => setView("list")}
          >
            <List size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}