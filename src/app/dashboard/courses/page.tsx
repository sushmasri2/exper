"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Plus, Grid, List, ChevronDown } from "lucide-react";

// Helper function to generate slug from course title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function Courses() {
  const [view, setView] = useState("grid");
  const [selectedCourse, setSelectedCourse] = useState("Select Course");
  const [sortByOption, setSortByOption] = useState("Newest");


  const sortBy = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "A-Z", value: "a-z" },
    { label: "Z-A", value: "z-a" },
  ];

  const coursesList = [
    { 
      id: 1, 
      title: "Artificial Intelligence Based Cardiovascular", 
      description: "Advanced AI techniques for cardiovascular diagnosis",
      slug: "artificial-intelligence-based-cardiovascular"
    },
    { 
      id: 2, 
      title: "Critical Care Medicine Fundamentals", 
      description: "Essential concepts in critical care medicine",
      slug: "critical-care-medicine-fundamentals"
    },
    { 
      id: 3, 
      title: "Emergency Medicine Protocols", 
      description: "Standard protocols for emergency medicine",
      slug: "emergency-medicine-protocols"
    },
  ];

  // Function to create new course with generated slug
  const handleCreateNewCourse = () => {
    const newCourseTitle = "New Course " + Date.now(); // You can customize this
    const courseSlug = generateSlug(newCourseTitle);
    return `/dashboard/courses/courseBuilder/${courseSlug}`;
  };

  return (
    <div className="shadow-sm p-6 bg-white rounded-lg">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-6 mb-6">
        {/* Left: Title - Fixed width */}
        <div className="flex-shrink-0">
          <h1 className="text-lg font-medium text-gray-900 whitespace-nowrap">All Courses(466)</h1>
        </div>

        {/* Center: Search and Filters - Flexible width */}
        <div className="flex items-center gap-4 flex-1 max-w-4xl">
          {/* Search - 30% of center area */}
          <Input
            placeholder="Search courses..."
            className="flex-[3] rounded-full border-gray-300"
          />

          {/* Filter Dropdown - 40% of center area */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-[4] gap-2 rounded-lg border-gray-300 text-left justify-between">
                <span className="truncate">{selectedCourse}</span>
                <ChevronDown size={16} className="flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {coursesList.map((course) => (
                <DropdownMenuItem
                  key={course.slug}
                  onClick={() => setSelectedCourse(course.title)}
                >
                  {course.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown - 30% of center area */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-[3] gap-2 rounded-lg border-gray-300 text-left justify-between">
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

        {/* Right: Create Button and View Toggle - Fixed width */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Create Button */}
          <Link href="/dashboard/courses/courseBuilder">
            <Button variant='courseCreate' className="whitespace-nowrap">
              <Plus size={16} /> Create New Course
            </Button>
          </Link>

          {/* View Toggle */}
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
        {view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {coursesList.map((course) => (
              <Link href={`/dashboard/courses/CourseBuilder/${course.slug}`} key={course.id}>
                <div className="border p-4 rounded-lg hover:shadow-md transition-shadow">
                  <h2 className="text-lg font-semibold">{course.title}</h2>
                  <p className="text-gray-500">{course.description}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {coursesList.map((course) => (
              <Link href={`/dashboard/courses/courseBuilder/${course.slug}`} key={course.id}>
                <div className="border p-4 rounded-lg hover:shadow-md transition-shadow">
                  <h2 className="text-lg font-semibold">{course.title}</h2>
                  <p className="text-gray-500">{course.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}