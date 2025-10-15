"use client";

import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Trash2 } from "lucide-react";
import Table from "@/components/ui/table";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { DeleteCourse } from "@/lib/courses-api";
import { useState } from "react";
import { showToast } from "@/lib/toast";

interface CourseTableViewProps {
  courses: Course[];
  onSort: (accessor: string, direction: 'asc' | 'desc') => void;
  onCourseDeleted?: () => void;
}

export function CourseTableView({
  courses,
  onSort,
  onCourseDeleted
}: CourseTableViewProps) {
  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const openDeleteModal = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCourseToDelete(null);
  };

  const handleDelete = (course: Course) => {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      openDeleteModal(course);
    };
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;

    try {
      await DeleteCourse(courseToDelete.uuid);
      closeDeleteModal();
      showToast(`Course "${courseToDelete.course_name}" has been deleted.`, "success" );
      onCourseDeleted?.(); // Refresh the course list
    } catch (error) {
      console.error('Failed to delete course:', error);
      showToast(`Failed to delete course. Please try again.`, "error");
    }
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
            header: "Category",
            accessor: "category_name",
            render: (value) => String(value) || "-"
          },
          {
            header: "Course Type",
            accessor: "type_name",
            sortable: true,
            render: (value) => String(value) || "-"
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
                {row.pricing.find(p => p.currency_code === "INR")?.formatted_price || "-"}
              </span>
            )
          },
          {
            header: "Price ($)",
            accessor: "pricedollars",
            sortable: true,
            render: (_value, row) => (
              <span>
                {row.pricing.find(p => p.currency_code === "USD")?.formatted_price || "-"}
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
                <Button className="p-2 bg-gray-100 hover:bg-red-50 rounded-lg text-red-600" onClick={handleDelete(row)}>
                  <Trash2 size={18} />
                </Button>
              </div>
            )
          }
        ]}
        data={courses}
        onSort={onSort}
      />
      <Modal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        type="confirmation"
        variant="delete"
        title="Delete Course"
        message={`Are you sure you want to delete the course "${courseToDelete?.course_name || ''}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        destructive={true}
      />
    </div>
  );
}