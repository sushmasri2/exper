"use client";

import { Course } from "@/types/course";
import { CourseCategory } from "@/types/coursecategory";
import { CourseType } from "@/types/coursetype";
import { CoursePricing } from "@/types/course-pricing";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Trash2 } from "lucide-react";
import Table from "@/components/ui/table";
import Link from "next/link";

interface CourseTableViewProps {
  courses: Course[];
  courseCategoryList: CourseCategory[];
  courseTypeList: CourseType[];
  pricingMap: Record<string, CoursePricing[]>;
  onSort: (accessor: string, direction: 'asc' | 'desc') => void;
}

export function CourseTableView({
  courses,
  courseCategoryList,
  courseTypeList,
  pricingMap,
  onSort
}: CourseTableViewProps) {
  const formatPrice = (price?: number | string) => {
    if (!price) return "-";
    const num = Number(price);
    return Number.isInteger(num) ? num : num.toFixed(2);
  };

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-4">
      <Table
        columns={[
          {
            header: "Course Name",
            accessor: "course_name",
            sortable: true,
            render: (value, row) => (
              <Link href={`/dashboard/courses/coursestructure?id=${row.id}`}>
                {String(value)}
              </Link>
            )
          },
          {
            header: "Course Code",
            accessor: "short_code",
            sortable: true
          },
          {
            header: "Category",
            accessor: "category_id",
            render: (value) => {
              const category = courseCategoryList.find(cat => cat.id === value);
              return category ? category.name : "-";
            }
          },
          {
            header: "Course Type",
            accessor: "course_type_id",
            sortable: true,
            render: (value) => {
              const type = courseTypeList.find(t => t.id === value);
              return type ? type.name : "-";
            }
          },
          {
            header: "Duration",
            accessor: "duration"
          },
          {
            header: "Price (₹)",
            accessor: "priceruppees",
            sortable: true,
            render: (_value, row) => (
              <span>
                {formatPrice(pricingMap[row.id]?.find(p => p.currency === "INR")?.price)}
              </span>
            )
          },
          {
            header: "Price ($)",
            accessor: "pricedollars",
            sortable: true,
            render: (_value, row) => (
              <span>
                {formatPrice(pricingMap[row.id]?.find(p => p.currency === "USD")?.price)}
              </span>
            )
          },
          {
            header: "Status",
            accessor: "status",
            sortable: true,
            render: (value) => {
              const statusKey = value === 1 ? "active" : "inactive";
              return (
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[statusKey]}`}
                >
                  {value === 1 ? "Live" : "Draft"}
                </span>
              );
            }
          },
          {
            header: "Actions",
            accessor: "actions",
            render: (value, row) => (
              <div className="flex gap-2">
                <Button className="p-2 bg-gray-100 hover:bg-blue-50 rounded-lg text-blue-600">
                  <Eye size={18} />
                </Button>
                <Link href={`/dashboard/courses/coursestructure?id=${row.id}`}>
                  <Button className="p-2 bg-gray-100 hover:bg-green-50 rounded-lg text-green-600">
                    <Edit size={18} />
                  </Button>
                </Link>
                <Button className="p-2 bg-gray-100 hover:bg-red-50 rounded-lg text-red-600">
                  <Trash2 size={18} />
                </Button>
              </div>
            )
          }
        ]}
        data={courses}
        onSort={onSort}
      />
    </div>
  );
}