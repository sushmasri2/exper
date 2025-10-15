"use client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { CategoryCreateRequest, CategoryUpdateRequest } from "@/types/coursecategory";
import { getCategoryById, createCategory, updateCategory } from "@/lib/coursecategory-api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { showToast } from '@/lib/toast';
import { useApiCache } from "@/hooks/use-api-cache";
import { setGlobalCacheInstance } from "@/lib/cache-utils";

export default function CategoryCreateUpdateForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryId = searchParams.get('id');
    const isEditMode = categoryId && categoryId !== 'new';

    // Set up cache instance for automatic cache invalidation
    const cacheInstance = useApiCache();
    setGlobalCacheInstance(cacheInstance);

    const [formData, setFormData] = useState<Partial<CategoryUpdateRequest> & { uuid?: string }>({
        name: '',
        description: '',
        short_code: '',
        slug: '',
        image: '',
        color_code: '#000000',
        background_color_code: '#ffffff',
        position: 0,
        status: 1,
        uuid: undefined,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    // Function to generate slug from name
    const generateSlug = (name: string): string => {
        return name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')           // Replace spaces with hyphens
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars except hyphens
            .replace(/\-\-+/g, '-')         // Replace multiple hyphens with single hyphen
            .replace(/^-+/, '')             // Trim hyphens from start
            .replace(/-+$/, '');            // Trim hyphens from end
    };

    // Validation function
    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        // Check mandatory fields
        if (!formData.name?.trim()) {
            errors.name = 'Category name is required';
        }

        if (!formData.slug?.trim()) {
            errors.slug = 'Category slug is required';
        }

        if (!formData.color_code?.trim()) {
            errors.color_code = 'Color code is required';
        }

        if (!formData.background_color_code?.trim()) {
            errors.background_color_code = 'Background color code is required';
        }

        // Validate image URL format if provided
        if (formData.image && formData.image.trim()) {
            try {
                new URL(formData.image);
            } catch {
                errors.image = 'Please enter a valid URL';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Fetch category data when in edit mode
    useEffect(() => {
        const fetchCategoryData = async () => {
            if (!isEditMode || !categoryId) return;

            try {
                setLoading(true);
                setError(null);
                const categoryData = await getCategoryById(parseInt(categoryId));
                setFormData(categoryData);
            } catch (err) {
                console.error('Error fetching category:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch category data');
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, [isEditMode, categoryId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        setFormData(prev => {
            const updatedData = {
                ...prev,
                [name]: type === 'number' ? parseInt(value) || 0 : value
            };

            // Auto-generate slug when category name changes (only for new categories)
            if (name === 'name') {
                updatedData.slug = generateSlug(value);
            }

            return updatedData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            if (isEditMode && formData.uuid) {
                // Update existing category
                const updateData: CategoryUpdateRequest = {
                    name: formData.name,
                    description: formData.description,
                    short_code: formData.short_code,
                    slug: formData.slug,
                    image: formData.image,
                    color_code: formData.color_code,
                    background_color_code: formData.background_color_code,
                    position: formData.position,
                    status: formData.status,
                };
                await updateCategory(formData.uuid, updateData);
                showToast('Category updated successfully!','success');
            } else {
                // Create new category
                const createData: CategoryCreateRequest = {
                    name: formData.name!,
                    description: formData.description!,
                    short_code: formData.short_code!,
                    slug: formData.slug,
                    image: formData.image,
                    color_code: formData.color_code!,
                    background_color_code: formData.background_color_code!,
                    position: formData.position,
                    status: formData.status,
                };
                await createCategory(createData);
                showToast('Category created successfully!', 'success');
            }

            router.push('/dashboard/categories');
        } catch (err) {
            console.error('Error saving category:', err);
            setError(err instanceof Error ? err.message : 'Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/dashboard/categories');
    };

    // Show loading spinner while fetching data
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner size="lg" text="Loading category data..." />
            </div>
        );
    }

    return (
        <>
            {error && (
                <div className="error-card">
                    <p className="error-text">
                        <strong>Error:</strong> {error}
                    </p>
                    <Button
                        variant='outline'
                        onClick={() => router.push('/dashboard/categories')}
                    >
                        Go Back to Categories
                    </Button>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">
                    {isEditMode ? 'Edit Category' : 'Create New Category'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-3">
                        <div>
                            <label className="font-semibold mb-2">
                                Category Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleInputChange}
                                placeholder="Enter category name"
                                className={validationErrors.name ? 'border-red-500' : ''}
                            />
                            {validationErrors.name && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                            )}
                        </div>
                        <div>
                            <label className="font-semibold mb-2">
                                Category Slug <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="slug"
                                value={formData.slug || ''}
                                onChange={handleInputChange}
                                placeholder="Enter category slug"
                                className={validationErrors.slug ? 'border-red-500' : ''}
                            />
                            {validationErrors.slug && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.slug}</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="font-semibold mb-2">Description</label>
                        <Textarea
                            name="description"
                            value={formData.description || ''}
                            onChange={handleInputChange}
                            placeholder="Enter category description"
                        />
                    </div>
                    <div>
                        <label className="font-semibold mb-2">Image URL</label>
                        <Input
                            type="url"
                            name="image"
                            className={`form-input ${validationErrors.image ? 'border-red-500' : ''}`}
                            value={formData.image || ''}
                            onChange={handleInputChange}
                            placeholder="Enter image URL"
                        />
                        {validationErrors.image && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.image}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-4 gap-6 mt-3">
                        <div>
                            <label className="font-semibold mb-2">
                                Color Code <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    name="color_code"
                                    className={`form-input ${validationErrors.color_code ? 'border-red-500' : ''}`}
                                    value={formData.color_code || '#000000'}
                                    onChange={handleInputChange}
                                    readOnly
                                />
                                <div
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg border-2 border-gray-200 cursor-pointer transition-all duration-300 hover:border-indigo-500"
                                    style={{ backgroundColor: formData.color_code || '#000000' }}
                                    onClick={() => {
                                        const colorInput = document.getElementById('colorPicker') as HTMLInputElement;
                                        colorInput?.click();
                                    }}
                                />
                                <Input
                                    type="color"
                                    id="colorPicker"
                                    value={formData.color_code || '#000000'}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, color_code: e.target.value }));
                                    }}
                                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                                />
                            </div>
                            {validationErrors.color_code && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.color_code}</p>
                            )}
                        </div>
                        <div>
                            <label className="font-semibold mb-2">
                                Background Color <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    name="background_color_code"
                                    className={`form-input ${validationErrors.background_color_code ? 'border-red-500' : ''}`}
                                    value={formData.background_color_code || '#ffffff'}
                                    onChange={handleInputChange}
                                    readOnly
                                />
                                <div
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg border-2 border-gray-200 cursor-pointer transition-all duration-300 hover:border-indigo-500"
                                    style={{ backgroundColor: formData.background_color_code || '#ffffff' }}
                                    onClick={() => {
                                        const colorInput = document.getElementById('bgPicker') as HTMLInputElement;
                                        colorInput?.click();
                                    }}
                                />
                                <Input
                                    type="color"
                                    id="bgPicker"
                                    value={formData.background_color_code || '#ffffff'}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, background_color_code: e.target.value }));
                                    }}
                                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                                />
                            </div>
                            {validationErrors.background_color_code && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.background_color_code}</p>
                            )}
                        </div>
                        <div>
                            <label className="font-semibold mb-2">Position</label>
                            <Input
                                type="number"
                                name="position"
                                className="form-input"
                                min="0"
                                value={formData.position || 0}
                                onChange={handleInputChange}
                                placeholder="0"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="font-semibold mb-2">Status</label>
                            <div className="flex gap-2 mt-2">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="1"
                                        checked={formData.status === 1}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: parseInt(e.target.value) }))}
                                        className="mr-2 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Active</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="0"
                                        checked={formData.status === 0}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: parseInt(e.target.value) }))}
                                        className="mr-2 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Inactive</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t-2 border-slate-200">
                        <Button onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button variant='primaryBtn' type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (isEditMode ? 'Update Category' : 'Create Category')}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}