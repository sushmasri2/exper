"use client";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Plus, Grid, List, ChevronDown, IndianRupee, DollarSign, Eye, Edit, Copy, Trash2, GraduationCap, BookOpen, Clock } from "lucide-react";
import { fetchCourses } from "@/lib/api/courses-api";
import { Course } from "@/types/course";

import { count } from "console";

// Helper function to generate slug from course title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function Courses() {
  const [coursesList, setCoursesList] = useState<Course[]>([]);

  const [view, setView] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCourseType, setSelectedCourseType] = useState("");
  const [sortByOption, setSortByOption] = useState("Newest");
  const [loading, setLoading] = useState(true);


  const sortBy = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "A-Z", value: "a-z" },
    { label: "Z-A", value: "z-a" },
  ];

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courses = await fetchCourses();
        setCoursesList(courses);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);
  // 🔹 Get unique categories & course types
  const uniqueCategories = [...new Set(coursesList.map((c) => c.category))];
  const uniqueCourseTypes = [...new Set(coursesList.map((c) => c.coursetype))];
  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
  };

  // 🔹 Derived courses based on filters & sorting
  const filteredCourses = useMemo(() => {
    let result = [...coursesList];

    // Search filter
    if (searchQuery) {
      result = result.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Course filter
    if (selectedCourse) {
      result = result.filter((c) => c.slug === selectedCourse);
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // Course Type filter
    if (selectedCourseType) {
      result = result.filter((c) => c.coursetype === selectedCourseType);
    }

    // Sorting
    if (sortByOption === "A-Z") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortByOption === "Z-A") {
      result.sort((a, b) => b.title.localeCompare(a.title));
    }

    return result;
  }, [coursesList,searchQuery, selectedCourse, selectedCategory, selectedCourseType, sortByOption]);
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="shadow-sm p-6 bg-white rounded-lg">

      {/* Header Row */}
      <div className="flex items-center justify-between gap-6 mb-6">
        {/* Title */}
        <div className="flex-shrink-0">
          <h1 className="text-lg font-medium text-gray-900 whitespace-nowrap">
            All Courses ({filteredCourses.length})
          </h1>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-4 flex-1 max-w-4xl">
          {/* Search */}
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-[3] rounded-full border-gray-300"
          />

          {/* Course Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex-[4] gap-2 rounded-lg border-gray-300 text-left justify-between"
              >
                <span className="truncate">
                  {selectedCourse
                    ? coursesList.find((c) => c.slug === selectedCourse)?.title
                    : "Select Course"}
                </span>
                <ChevronDown size={16} className="flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              {/* Reset option */}
              <DropdownMenuItem onClick={() => setSelectedCourse(null)}>
                Select Course
              </DropdownMenuItem>

              {coursesList.map((course) => (
                <DropdownMenuItem
                  key={course.slug}
                  onClick={() => setSelectedCourse(course.slug)}
                >
                  {course.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>


          {/* Category Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex-[4] gap-2 rounded-lg border-gray-300 text-left justify-between"
              >
                <span className="truncate">
                  {selectedCategory === "" ? "Select Category" : selectedCategory}
                </span>
                <ChevronDown size={16} className="flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedCategory("")}>
                Select Category
              </DropdownMenuItem>
              {uniqueCategories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Course Type Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex-[4] gap-2 rounded-lg border-gray-300 text-left justify-between"
              >
                <span className="truncate">
                  {selectedCourseType === "" ? "Select Course Type" : selectedCourseType}
                </span>
                <ChevronDown size={16} className="flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedCourseType("")}>
                Select Course Type
              </DropdownMenuItem>
              {uniqueCourseTypes.map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => setSelectedCourseType(type)}
                >
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
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

        {/* Create & View Toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/dashboard/courses/courseStructure">
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

      {/* Course Content */}
      <div>
        {filteredCourses.length === 0 ? (
          <p className="text-gray-500">No courses found.</p>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <Link
                href={`/dashboard/courses/courseStructure?id=${course.id}`}
                key={course.id}
              >
                <div className="relative bg-white border rounded-2xl shadow-md hover:shadow-lg transition p-6 flex flex-col gap-4">
                  {/* Top Row */}
                  <div className="flex justify-between items-start">
                    {/* Left - Title + Code */}
                    <div>
                      <span className="inline-block bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                        {course.coursecode}
                      </span>
                      <h2 className="text-lg font-bold mt-2 leading-snug line-clamp-2 h-[3rem]">{course.title}</h2>
                    </div>

                    {/* Status + Actions */}
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${course.status === "inactive"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                          }`}
                      >
                        {course.status === "active" ? "Live" : "Draft"}
                      </span>
                      <div className="flex gap-2">
                        <button className="p-2 bg-gray-100 hover:bg-blue-50 rounded-lg text-blue-600">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 bg-gray-100 hover:bg-green-50 rounded-lg text-green-600">
                          <Edit size={18} />
                        </button>
                        <button className="p-2 bg-gray-100 hover:bg-red-50 rounded-lg text-red-600">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">{course.description}</p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2  gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2 text-sm text-gray-700">
                        <BookOpen size={16} /> Category
                      </h4>
                      <p className="text-gray-900">{course.category}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2 text-sm text-gray-700">
                        <GraduationCap size={20} /> Course Type
                      </h4>
                      <p className="text-gray-900">{course.coursetype}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2 text-sm text-gray-700">
                        <Clock size={16} /> Duration
                      </h4>
                      <p className="text-gray-900">{course.duration}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2 text-sm text-gray-700">
                        Price
                      </h4>
                      <div className="flex items-baseline gap-3">
                        <span className="text-xl font-bold text-gray-900 flex items-center"><IndianRupee size={16} />{course.priceruppees}</span>
                        <span className="text-xl font-bold text-gray-900 flex items-center">/<DollarSign size={16} />{course.pricedollars}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <Link
                href={`/dashboard/courses/courseStructure/${course.slug}`}
                key={course.id}
              >
                <div className="border p-4 rounded-lg hover:shadow-md transition-shadow">
                  <h2 className="text-lg font-semibold">{course.title}</h2>
                  <p className="text-gray-500">{course.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div >
  );
}