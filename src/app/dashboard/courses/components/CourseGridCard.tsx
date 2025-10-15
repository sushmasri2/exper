"use client";

import Link from "next/link";
import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Edit, Eye, GraduationCap, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { DeleteCourse } from "@/lib/courses-api";
import { useState } from "react";
import { showToast } from "@/lib/toast";

interface CourseGridCardProps {
  course: Course;
  onCourseDeleted?: () => void;
}

export function CourseGridCard({
  course,
  onCourseDeleted
}: CourseGridCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);
  const handleDelete = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    openDeleteModal();
  };

  const confirmDelete = async () => {
    try {
      await DeleteCourse(course.uuid);
      closeDeleteModal();
      showToast(`Course "${course.course_name}" has been deleted.`, "success");
      onCourseDeleted?.(); // Refresh the course list
    } catch (error) {
      console.error('Failed to delete course:', error);
      showToast(`Failed to delete course. Please try again.`, "error");
    }
  };

  return (
    <>
      <Link href={`/dashboard/courses/coursestructure?id=${course.id}`}>
        <div className="relative bg-white border rounded-2xl shadow-md hover:shadow-lg transition p-6 flex flex-col gap-4">
          {/* Top Row */}
          <div className="flex justify-between items-start">
            {/* Left - Title + Code */}
            <div>
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
                <Button className="p-2 bg-gray-100 hover:bg-red-50 rounded-lg text-red-600" onClick={handleDelete}>
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{course.one_line_description}</p>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2">
              <BookOpen size={16} />
              <p className="text-gray-900">
                {course.category_name}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2">
              <GraduationCap size={20} />
              <p className="text-gray-900">
                {course.type_name || "-"}
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
                  {course.pricing.find(p => p.currency_code === "INR")?.formatted_price || "-"}
                </span>
                <span className="text-xl font-bold text-gray-900 flex items-center">
                  /
                  {course.pricing.find(p => p.currency_code === "USD")?.formatted_price || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Delete Confirmation Modal - Outside Link to prevent redirection */}
      <Modal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        type="confirmation"
        variant="delete"
        title="Delete Course"
        message={`Are you sure you want to delete the course "${course.course_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        destructive={true}
      />
    </>
  );
}