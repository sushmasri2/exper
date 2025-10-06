"use client";
import { CourseType } from "@/types/coursetype";
import { getCoursesType ,createCourseType,updateCourseType,deleteCourseType} from "@/lib/coursetype-api";
import { useEffect } from "react";
import React from "react";
import Table from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { showToast } from '@/lib/toast';
import { useApiCache } from "@/hooks/use-api-cache";
import { setGlobalCacheInstance } from "@/lib/cache-utils";

export default function CourseTypePage() {
    // Set up cache instance for automatic cache invalidation
    const cacheInstance = useApiCache();
    setGlobalCacheInstance(cacheInstance);

    const [courseTypes, setCourseTypes] = React.useState<CourseType[]>([]);
    const [showForm, setShowForm] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [editingUUID, seteditingUUID] = React.useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [courseTypeToDelete, setCourseTypeToDelete] = React.useState<CourseType | null>(null);
    const [formData, setFormData] = React.useState({
        name: "",
        code: "",
        position: "",
        status: "1",
        image: "",
        description: ""
    });

    useEffect(() => {
        const fetchCourseType = async () => {
            const data: CourseType[] = await getCoursesType();
            setCourseTypes(data);
        };

        fetchCourseType();
    }, []);

    const handleAddCourseType = () => {
        setFormData({
            name: "",
            code: "",
            position: "",
            status: "1",
            image: "",
            description: ""
        });
        setIsEditing(false);
        setShowForm(!showForm);
    };

    const handleEditCourseType = (courseType: CourseType) => {
        setFormData({
            name: courseType.name,
            code: courseType.code,
            position: courseType.position?.toString() || "",
            status: courseType.status?.toString() || "1",
            image: courseType.image || "",
            description: courseType.description || ""
        });
        seteditingUUID(courseType.uuid);
        setIsEditing(true);
        setShowForm(true);
        setError(null);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCancel = () => {
        setShowForm(false);
        setIsEditing(false);
        seteditingUUID(null);
        setError(null);
        setFormData({
            name: "",
            code: "",
            position: "",
            status: "1",
            image: "",
            description: ""
        });
    };

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            setError("Course Type name is required");
            return false;
        }
        if (!formData.code.trim()) {
            setError("Course Type code is required");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            const courseTypeData = {
                name: formData.name.trim(),
                code: formData.code.trim(),
                position: formData.position ? parseInt(formData.position) : 0,
                status: parseInt(formData.status),
                image: formData.image.trim(),
                description: formData.description.trim()
            };

            if (isEditing && editingUUID) {
                await updateCourseType(editingUUID, courseTypeData);
                showToast('Course Type updated successfully', 'success');
            } else {
                await createCourseType(courseTypeData);
                showToast('Course Type created successfully', 'success');
            }

            // Refresh the course types list
            const updatedCourseTypes = await getCoursesType();
            setCourseTypes(updatedCourseTypes);

            // Reset form and close it
            handleCancel();

        } catch (error) {
            console.error('Error saving course type:', error);
            setError(error instanceof Error ? error.message : 'An error occurred while saving');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (courseType: CourseType) => {
        setCourseTypeToDelete(courseType);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!courseTypeToDelete) return;

        setLoading(true);
        setError(null);

        try {
            await deleteCourseType((courseTypeToDelete.uuid));

            // Refresh the course types list
            const updatedCourseTypes = await getCoursesType();
            setCourseTypes(updatedCourseTypes);

            showToast('Course Type deleted successfully', 'success');

        } catch (error) {
            console.error('Error deleting course type:', error);
            setError(error instanceof Error ? error.message : 'An error occurred while deleting');
            showToast('Failed to delete course type', 'error');
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
            setCourseTypeToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setCourseTypeToDelete(null);
    };

    return <>
        <div className="flex justify-end gap-3 mb-3">
            <Button variant="primaryBtn" onClick={handleAddCourseType}>
                {showForm ? 'Cancel' : 'Add Course Type'}
            </Button>
        </div>
        {showForm && (
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <p className="font-semibold mb-2 text-lg">
                    {isEditing ? 'Edit Course Type' : 'Create Course Type'}
                </p>
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label>Course Type</label>
                        <Input
                            type="text"
                            placeholder="Course Type Name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Course Type Code</label>
                        <Input
                            type="text"
                            placeholder="Course Type Code"
                            value={formData.code}
                            onChange={(e) => handleInputChange('code', e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Position</label>
                        <Input
                            type="number"
                            placeholder="Position"
                            value={formData.position}
                            onChange={(e) => handleInputChange('position', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="font-semibold mb-2">Status</label>
                        <div className="flex gap-2">
                            <label className="flex items-center cursor-pointer">
                                <Input
                                    type="radio"
                                    name="status"
                                    value="1"
                                    checked={formData.status === "1"}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    className="mr-2 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <Input
                                    type="radio"
                                    name="status"
                                    value="0"
                                    checked={formData.status === "0"}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    className="mr-2 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Inactive</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="mb-4">
                    <label>Image</label>
                    <Input
                        type="text"
                        placeholder="Image URL"
                        value={formData.image}
                        onChange={(e) => handleInputChange('image', e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label>Description</label>
                    <Textarea
                        placeholder="Course Type Description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="primaryBtn"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update' : 'Create')}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={loading}>
                        Cancel
                    </Button>
                </div>
            </div>
        )}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            {courseTypes.length > 0 ? (
                <Table
                    columns={[
                        {
                            header: "S.No",
                            accessor: "index",
                            render: (value: unknown, row: Record<string, unknown>, index: number) => (
                                <>{index + 1}</>
                            ),
                        },
                        {
                            header: "Course Type Name",
                            accessor: "name",
                            render: (value: unknown) => <>{value as string}</>,
                        },
                        {
                            header: "Description",
                            accessor: "description",
                            render: (value: unknown) => <>{value as string}</>,
                        },
                        {
                            header: "Code",
                            accessor: "code",
                            render: (value: unknown) => <>{value as string}</>,
                        },
                        {
                            header: "Image",
                            accessor: "image",
                            render: (value: unknown) => <>{value as string}</>,
                        },
                        {
                            header: "Position",
                            accessor: "position",
                            render: (value: unknown) => (value as string),
                        },
                        {
                            header: "Status",
                            accessor: "status",
                            render: (value: unknown) => ((value as number) === 1 ? "Active" : "Inactive"),
                        },
                        {
                            header: "Actions",
                            accessor: "actions",
                            render: (value: unknown, row: Record<string, unknown>) => (
                                <div className="flex gap-2">
                                    <Button
                                        variant='outline'
                                        onClick={() => handleEditCourseType(row as unknown as CourseType)}
                                        disabled={loading}
                                    >
                                        <Edit />
                                    </Button>
                                    <Button
                                        variant='outline'
                                        onClick={() => handleDeleteClick(row as unknown as CourseType)}
                                        disabled={loading}
                                    >
                                        <Trash2 color="red" />
                                    </Button>
                                </div>
                            )
                        }
                    ]}
                    data={courseTypes as unknown as Record<string, unknown>[]}
                    className="min-w-full divide-y divide-gray-200 "
                    responsive
                />
            ) : (
                <p>No course types available.</p>
            )}
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
            type="confirmation"
            variant="delete"
            open={showDeleteModal}
            onOpenChange={setShowDeleteModal}
            title="Delete Course Type"
            message={`Are you sure you want to delete "${courseTypeToDelete?.name}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            loading={loading}
        />
    </>
}