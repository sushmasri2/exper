"use client";

import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileText } from "lucide-react";
import Table from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { DeleteCourse } from "@/lib/courses-api";
import { useState } from "react";
import { showToast } from "@/lib/toast";

interface CourseListViewProps {
  courses: Course[];
  onSort: (accessor: string, direction: 'asc' | 'desc') => void;
  onCourseDeleted?: () => void;
}

export function CourseListView({
  courses,
  onSort,
  onCourseDeleted
}: CourseListViewProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCourseToDelete(null);
  };

  const handleEdit = (course: Course) => {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      // Navigate to edit page or open edit modal
      console.log('Edit course:', course.uuid);
      // TODO: Implement edit functionality
      showToast("Edit functionality to be implemented", "info");
    };
  };

  const handleDelete = (course: Course) => {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      openDeleteModal(course);
    };
  };

  const handleLogs = (course: Course) => {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      // Navigate to logs page or open logs modal
      console.log('View logs for course:', course.uuid);
      // TODO: Implement logs functionality
      showToast("Logs functionality to be implemented", "info");
    };
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;

    setIsDeleting(true);
    try {
      await DeleteCourse(courseToDelete.uuid);
      closeDeleteModal();
      showToast(`Course "${courseToDelete.course_name}" has been deleted.`, "success");
      onCourseDeleted?.(); // Refresh the course list
    } catch (error) {
      console.error('Failed to delete course:', error);
      showToast(`Failed to delete course. Please try again.`, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <Table
          columns={[
            {
              header: "Course Name",
              accessor: "course_name",
              sortable: true,
              render: (value) => (
                <div className="font-medium text-foreground">
                  {String(value)}
                </div>
              )
            },
            {
              header: "Category",
              accessor: "category_name",
              sortable: true,
              render: (value) => (
                <span className="text-muted-foreground">
                  {String(value) || "-"}
                </span>
              )
            },
            {
              header: "Course Type",
              accessor: "type_name",
              sortable: true,
              render: (value) => (
                <span className="text-muted-foreground">
                  {String(value) || "-"}
                </span>
              )
            },
            {
              header: "Version",
              accessor: "version",
              sortable: true,
              render: (value) => (
                <span className="text-muted-foreground">
                  {String(value) || "1.0"}
                </span>
              )
            },
            {
              header: "Actions",
              accessor: "actions",
              sortable: false,
              render: (_, row) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit(row)}
                    className="h-8 w-8 p-0"
                    title="Edit Course"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete(row)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:border-red-300 dark:text-red-400 dark:hover:text-red-300 dark:hover:border-red-500"
                    title="Delete Course"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogs(row)}
                    className="h-8 w-8 p-0"
                    title="View Logs"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              )
            }
          ]}
          data={courses}
          onSort={onSort}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteModalOpen}
        onClose={closeDeleteModal}
        type="confirmation"
        variant="delete"
        title="Delete Course"
        message={`Are you sure you want to delete the course "${courseToDelete?.course_name}"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        destructive={true}
        loading={isDeleting}
      />
    </>
  );
}