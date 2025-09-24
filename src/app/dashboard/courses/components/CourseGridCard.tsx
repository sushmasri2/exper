"use client";

import Link from "next/link";
import { Course } from "@/types/course";
import { CourseCategory } from "@/types/coursecategory";
import { CourseType } from "@/types/coursetype";
import { CoursePricing } from "@/types/course-pricing";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, DollarSign, Edit, Eye, GraduationCap, IndianRupee, Trash2 } from "lucide-react";

interface CourseGridCardProps {
  course: Course;
  courseCategoryList: CourseCategory[];
  courseTypeList: CourseType[];
  pricingMap: Record<string, CoursePricing[]>;
}

export function CourseGridCard({
  course,
  courseCategoryList,
  courseTypeList,
  pricingMap
}: CourseGridCardProps) {
  const formatPrice = (price?: number | string) => {
    if (!price) return "-";
    const num = Number(price);
    return Number.isInteger(num) ? num : num.toFixed(2);
  };

  return (
    <Link href={`/dashboard/courses/coursestructure?id=${course.id}`}>
      <div className="relative bg-white border rounded-2xl shadow-md hover:shadow-lg transition p-6 flex flex-col gap-4">
        {/* Top Row */}
        <div className="flex justify-between items-start">
          {/* Left - Title + Code */}
          <div>
            {course.short_code && (
              <span className="inline-block bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                {course.short_code}
              </span>
            )}
            <h2 className="text-lg font-bold mt-2 leading-snug line-clamp-2 h-[3rem]">{course.course_name}</h2>
          </div>

          {/* Status + Actions */}
          <div className="flex flex-col items-end gap-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${course.status === 0
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
                }`}
            >
              {course.status === 1 ? "Live" : "Draft"}
            </span>
            <div className="flex gap-2">
              <Button className="p-2 bg-gray-100 hover:bg-blue-50 rounded-lg text-blue-600">
                <Eye size={18} />
              </Button>
              <Button className="p-2 bg-gray-100 hover:bg-green-50 rounded-lg text-green-600">
                <Edit size={18} />
              </Button>
              <Button className="p-2 bg-gray-100 hover:bg-red-50 rounded-lg text-red-600">
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed">{course.one_line_description}</p>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2">
            <BookOpen size={16} />
            <p className="text-gray-900">
              {courseCategoryList.find(cat => cat.id === course.category_id)?.name}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2">
            <GraduationCap size={20} />
            <p className="text-gray-900">
              {courseTypeList.find(type => type.id === course.course_type_id)?.name || "-"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2">
            <Clock size={16} />
            <p className="text-gray-900">{course.duration}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2">
            <div className="flex items-baseline gap-3">
              <span className="text-xl font-bold text-gray-900 flex items-center">
                <IndianRupee size={16} />
                {formatPrice(pricingMap[course.id]?.find(p => p.currency === "INR")?.price)}
              </span>
              <span className="text-xl font-bold text-gray-900 flex items-center">
                /<DollarSign size={16} />
                {formatPrice(pricingMap[course.id]?.find(p => p.currency === "USD")?.price)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}