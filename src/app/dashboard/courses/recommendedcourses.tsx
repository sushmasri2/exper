"use client";

import { Course } from "@/types/course";
import { RecommendedCourse } from "@/types/recommendedcourses";
import { getRecommendedCourse, updateRecommendedCourse, addRecommendedCourse, deleteRecommendedCourse } from "@/lib/recommendedcourse-api";
import { getCourses } from "@/lib/courses-api";
import { useEffect, useState } from "react";
import Table from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select2 from "@/components/ui/Select2";
import { Edit, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { showToast } from "@/lib/toast";
interface CourseRecommendedProps {
    courseData?: Course | null;
}
export default function RecommendedCourses({ courseData }: CourseRecommendedProps) {
    const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourse[]>([]);
    const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        course_uuid: "",
        position: 0,
        status: 1,
        must_have: 0
    });

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch available courses for the dropdown
                const courses = await getCourses();
                setAvailableCourses(courses);
                // Fetch recommended courses if courseData is available
                if (courseData && courseData.uuid) {
                    const recommendedCourses = await getRecommendedCourse(courseData.uuid);
                    console.log("Recommended courses fetched:", courseData.uuid);
                    setRecommendedCourses(recommendedCourses);
                    console.log("Fetched recommended courses:", recommendedCourses);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
            finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [courseData]);

    const handleAdd = () => {
        setShowForm(true);
        setEditingId(null);
        setFormData({
            course_uuid: "",
            position: 0,
            status: 1,
            must_have: 0
        });
    };

    const handleEdit = (row: RecommendedCourse) => {
        setShowForm(true);
        setEditingId(row.id);
        setFormData({
            course_uuid: row.recommendedCourse.uuid,  // This should match the uuid in availableCourses
            position: row.position,
            status: row.status,
            must_have: row.must_have
        });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            course_uuid: "",
            position: 0,
            status: 1,
            must_have: 0
        });
    };
    const handleSave = async () => {
        if (!courseData) {
            console.error("Course data is not available.");
            return;
        }
        const selectedCourse = availableCourses.find(course => course.uuid === formData.course_uuid);
        if (!selectedCourse) {
            console.error("Selected course is not valid.");
            return;
        }
        const payload = {
            course_uuid: courseData.uuid, // Main course UUID
            recommended_course_uuid: selectedCourse.uuid, // Selected recommended course UUID
            position: formData.position,
            status: formData.status,
            must_have: formData.must_have
        };
        try {
            if (editingId) {
                // Update existing recommended course
                const editingCourse = recommendedCourses.find(rc => rc.id === editingId);
                const recommendedCourseUuid = editingCourse?.uuid; // This is the recommended course UUID
                if (!recommendedCourseUuid) {
                    console.error("Recommended course uuid not found for update.");
                    return;
                }
                // Pass payload and recommended course UUID
                const updated = await updateRecommendedCourse(payload, recommendedCourseUuid);
                setRecommendedCourses(prev => prev.map(rc => rc.id === editingId ? updated : rc));
            } else {
                // Add new recommended course - only payload needed
                try {
                    const added = await addRecommendedCourse(payload);
                    setRecommendedCourses(prev => [...prev, added]);
                } catch (error: unknown) {
                    // Check for 409 Conflict error
                    if (typeof error === "object" && error !== null && "message" in error && typeof (error as { message?: string }).message === "string" && (error as { message: string }).message.includes('409')) {
                        showToast("This recommended course already exists.", "error");
                    } else {
                        showToast("Error saving recommended course.", "error");
                    }
                    return;
                }
            }
            handleCancel();
        }
        catch (error: unknown) {
            // Check for 409 Conflict error
            if (
                typeof error === "object" &&
                error !== null &&
                "message" in error &&
                typeof (error as { message?: string }).message === "string" &&
                (error as { message: string }).message.includes('409')
            ) {
                showToast("This recommended course already exists.", "error");
            } else {
                showToast("Error saving recommended course.", "error");
            }
            console.error("Error saving recommended course:", error);
        }
    };

    const handleDelete = (uuid: string) => {
        setIsDeleteModalOpen(true);
        setDeletingCourseId(uuid); // This should be the recommended course UUID
    }
    const confirmDelete = async () => {
        if (!deletingCourseId) {
            console.error("No course selected for deletion.");
            return;
        }
        try {
            // Pass the recommended course UUID directly
            await deleteRecommendedCourse(deletingCourseId);

            // Remove from state using the UUID
            setRecommendedCourses(courses => courses.filter(course => course.uuid !== deletingCourseId));
            showToast("Recommended course deleted successfully", "success");
            closeDeleteModal();
        } catch (error) {
            console.error("Error deleting recommended course:", error);
        }
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingCourseId(null);
    };
    if (loading) return <div>Loading...</div>;

    return <>
        <div className="flex justify-end mb-4">
            <Button variant="primaryBtn" onClick={handleAdd}>Add Recommended Course</Button>
        </div>
        {showForm && (
            <div className="border p-4 rounded-lg mb-4">
                <h2 className="text-lg font-semibold mb-3">
                    {editingId ? "Edit Recommended Course" : "Add Recommended Course"}
                </h2>
                <div className="grid grid grid-cols-[3fr_1fr_1fr_1fr] gap-4">
                    <div>
                        <label>Select Course</label>
                        <Select2
                            options={availableCourses.map(course => ({
                                label: course.course_name,
                                value: course.uuid
                            }))}
                            value={formData.course_uuid || ""}
                            placeholder="Select a course..."
                            className="min-w-[200px]"
                            onChange={(value) => setFormData(prev => ({ ...prev, course_uuid: value as string }))}
                            style={{ padding: '0.6rem' }}
                        />
                    </div>
                    <div>
                        <label>Position</label>
                        <Input
                            type="number"
                            value={formData.position}
                            onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) || 0 }))}
                        />
                    </div>
                    <div>
                        <label>Status</label>
                        <Select2
                            options={[
                                { label: "Active", value: "1" },
                                { label: "Inactive", value: "0" }
                            ]}
                            value={formData.status.toString()}
                            placeholder="Select status..."
                            onChange={(value) => setFormData(prev => ({ ...prev, status: parseInt(value as string) }))}
                            style={{ padding: '0.6rem' }}
                        />
                    </div>
                    <div>
                        <label>Must Have</label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.must_have === 1}
                                onChange={(e) => setFormData(prev => ({ ...prev, must_have: e.target.checked ? 1 : 0 }))}
                                className="sr-only"
                            />
                            <div className={`relative inline-flex h-6 w-11 mt-3 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${formData.must_have === 1 ? 'bg-blue-600' : 'bg-gray-200'
                                }`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.must_have === 1 ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </div>
                        </label>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button variant="outline" onClick={handleCancel} className="mt-4">Cancel</Button>
                    <Button variant="primaryBtn" onClick={handleSave} className="mt-4 ml-2">
                        {editingId ? "Update" : "Save"}
                    </Button>
                </div>
            </div>
        )}
        <div>
            {recommendedCourses.length > 0 ? (
                <Table responsive={true} bordered={true}
                    columns={[
                        {
                            header: "S.No",
                            accessor: "index",
                            render: (value: unknown, row: RecommendedCourse, index: number) => (
                                <>{index + 1}</>
                            ),
                        },
                        {
                            header: "Course Name",
                            accessor: "course_name",
                            render: (value: unknown, row: RecommendedCourse) => (
                                <>{row.recommendedCourse.course_name}</>
                            ),
                        },
                        {
                            header: "Position",
                            accessor: "position",
                        },
                        {
                            header: "Must Have",
                            accessor: "must_have",
                            render: (value: unknown) => ((value as boolean) ? "Yes" : "No"),
                        },
                        {
                            header: "Status",
                            accessor: "status",
                            render: (value: unknown) => ((value as boolean) ? "Active" : "Inactive"),
                        },
                        {
                            header: "Actions",
                            accessor: "actions",
                            render: (value: unknown, row: RecommendedCourse) => (
                                <>
                                    <Button variant='outline' onClick={() => handleEdit(row)}><Edit /></Button>
                                    <Button variant='outline' onClick={() => handleDelete(row.uuid)} className="ml-2"><Trash2 color="red" /></Button>
                                </>
                            )
                        }
                    ]}
                    data={recommendedCourses.map((recommendation) => ({
                        ...recommendation,
                        course_name: recommendation.recommendedCourse.course_name,
                    }))}
                />
            ) : (
                <p>No recommended courses available.</p>
            )}
        </div>
        <Modal
            open={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            type="confirmation"
            variant="delete"
            title="Delete Recommended Course"
            message={`Are you sure you want to delete this recommended course? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={confirmDelete}
            onCancel={closeDeleteModal}
            destructive={true}
        />
    </>;
}