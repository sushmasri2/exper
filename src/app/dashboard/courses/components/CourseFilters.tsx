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
import { ChevronDown, Grid, List, Plus, RefreshCw } from "lucide-react";
import { CourseCategory } from "@/types/coursecategory";
import { CourseType } from "@/types/coursetype";
import { useState, useMemo } from "react";
import { CreatingCourse } from "./CreateCourseModal";

interface CourseFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
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
  courseCount
}: CourseFiltersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Memoize category options to prevent recreation on every render
  const categoryOptions = useMemo(() => [
    { label: 'All Categories', value: '' },
    ...courseCategoryList.map(cat => ({
      label: cat.name,
      value: cat.id.toString()
    }))
  ], [courseCategoryList]);

  // Memoize course type options to prevent recreation on every render
  const courseTypeOptions = useMemo(() => [
    { label: 'All Course Types', value: '' },
    ...courseTypeList.map(type => ({
      label: type.name,
      value: type.id.toString()
    }))
  ], [courseTypeList]);

  // Shared components
  const ViewToggle = useMemo(() => (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <Button
        variant={view === "grid" ? "primaryBtn" : "ghost"}
        size="icon"
        onClick={() => setView("grid")}
        className={view === "grid" ? "" : "hover:bg-gray-200"}
      >
        <Grid size={16} />
      </Button>
      <Button
        variant={view === "list" ? "primaryBtn" : "ghost"}
        size="icon"
        onClick={() => setView("list")}
        className={view === "list" ? "" : "hover:bg-gray-200"}
      >
        <List size={16} />
      </Button>
    </div>
  ), [view, setView]);
  
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCourseType('');
    setSortByOption('newest');
  }

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchQuery !== '' || 
           selectedCategory !== '' || 
           selectedCourseType !== '' || 
           sortByOption !== 'newest';
  }, [searchQuery, selectedCategory, selectedCourseType, sortByOption]);

  const resetButton = () => (
    <Button 
      variant="destructive" 
      onClick={() => resetFilters()}
      disabled={!hasActiveFilters}
      className={!hasActiveFilters ? 'opacity-50 cursor-not-allowed' : ''}
    >
      <RefreshCw className="h-4 w-4" /> Reset
    </Button>
  )

  const CreateButton = ({ mobile = false }: { mobile?: boolean }) => (
    <Button
      variant="primaryBtn"
      onClick={() => setIsModalOpen(true)}
      size={mobile ? "sm" : "default"}
      className={mobile ? "" : "whitespace-nowrap"}
    >
      <Plus size={16} />
      {mobile ? (
        <>
          <span className="hidden sm:inline">Create New Course</span>
          <span className="sm:hidden">Create</span>
        </>
      ) : (
        <span>Create New Course</span>
      )}
    </Button>
  );

  const FilterControls = useMemo(() => (
    <>
      <Input
        placeholder="Search courses..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="rounded-full border-gray-300 w-full"
      />
      <Select2
        options={categoryOptions}
        value={selectedCategory}
        onChange={val => {
          if (typeof val === 'string') setSelectedCategory(val);
        }}
        placeholder="Select Category"
      />
      <Select2
        options={courseTypeOptions}
        value={selectedCourseType}
        onChange={val => {
          if (typeof val === 'string') setSelectedCourseType(val);
        }}
        placeholder="Select Course Type"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 rounded-lg border-gray-300 text-left justify-between"
          >
            <span className="truncate">{sortBy.find(s => s.value === sortByOption)?.label || sortByOption}</span>
            <ChevronDown size={16} className="flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {sortBy.map((sortby) => (
            <DropdownMenuItem
              key={sortby.value}
              onClick={() => {
                console.log('🎯 Sort option clicked:', sortby.value, 'from previous:', sortByOption);
                setSortByOption(sortby.value);
              }}
            >
              {sortby.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  ), [searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, selectedCourseType, setSelectedCourseType, sortByOption, setSortByOption, categoryOptions, courseTypeOptions]);

  return (
    <>
      <div className="top-0 z-30 bg-white shadow-sm p-4 lg:p-6 rounded-lg">
        {/* Mobile & Tablet Layout (up to xl) */}
        <div className="block xl:hidden">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-medium text-gray-900">
              All Courses ({courseCount})
            </h1>
            <div className="flex items-center gap-3">
              {resetButton()}
              <CreateButton mobile />
              {ViewToggle}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FilterControls}
          </div>
        </div>

        {/* Desktop Layout (xl and above) */}
        <div className="hidden xl:flex items-center justify-between gap-6">
          <div className="flex-shrink-0">
            <h1 className="text-lg font-medium text-gray-900 whitespace-nowrap">
              All Courses ({courseCount})
            </h1>
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-4xl">
            {FilterControls}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {resetButton()}
            <CreateButton />
            {ViewToggle}
          </div>
        </div>
      </div>

      {/* Create Course Modal */}
      <CreatingCourse
        courseCategoryList={courseCategoryList}
        courseTypeList={courseTypeList}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}