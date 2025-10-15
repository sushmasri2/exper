import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CourseCategory } from "@/types/coursecategory";
import { CourseType } from "@/types/coursetype";
import Select2 from "@/components/ui/Select2";
import { CreateCourse } from '@/lib/courses-api';
import { showToast } from '@/lib/toast';
import { useApiCache } from '@/hooks/use-api-cache';
import { validateField, courseValidationRules, ValidationError as ValidationErrorType } from '../utils/validation';

interface APIValidationError extends Error {
    isValidationError?: boolean;
    validationErrors?: Record<string, string[]>;
}

interface CreateCourseProps {
    courseCategoryList: CourseCategory[];
    courseTypeList: CourseType[];
    isOpen: boolean;
    onClose: () => void;
    onCourseCreated?: () => void;
}

// Field Configuration for API mapping
const FIELD_CONFIG = {
    category: { apiField: 'category_id', displayName: 'Category' },
    courseType: { apiField: 'course_type_id', displayName: 'Course Type' },
    name: { apiField: 'course_name', displayName: 'Course Name' },
    title: { apiField: 'title', displayName: 'Course Title' },
    cardTitle: { apiField: 'course_card_title', displayName: 'Course Card Title' },
    description: { apiField: 'one_line_description', displayName: 'Description' }
};

// Initial form state
const INITIAL_FORM_STATE = {
    category: '',
    courseType: '',
    coursecode: '',
    shortCode: '',
    name: '',
    title: '',
    cardTitle: '',
    description: ''
};




const generateCourseName = (courseTypeId: string, title: string, courseTypeList: CourseType[]) => {
    if (!courseTypeId || !title.trim()) return '';
    const selectedCourseType = courseTypeList.find(type => String(type.id) === courseTypeId);
    return selectedCourseType ? `${selectedCourseType.name} in ${title.trim()}` : title.trim();
};

// Utility Functions
const validateForm = (formData: typeof INITIAL_FORM_STATE) => {
    const errors = { ...INITIAL_FORM_STATE };
    const validationErrors: ValidationErrorType[] = [];

    // Map form fields to API fields and validate using validation.ts rules
    Object.entries(FIELD_CONFIG).forEach(([fieldKey, config]) => {
        const value = formData[fieldKey as keyof typeof formData];
        const apiFieldName = config.apiField;
        
        // Convert string values to appropriate types for validation
        let processedValue: string | number | undefined = value;
        if (fieldKey === 'category' || fieldKey === 'courseType') {
            // Convert to number for ID fields
            processedValue = value ? parseInt(value as string) : undefined;
        }
        
        // Get validation rules for this field
        const rules = courseValidationRules[apiFieldName as keyof typeof courseValidationRules];
        
        if (rules) {
            const validationError = validateField(apiFieldName, processedValue, rules);
            if (validationError) {
                errors[fieldKey as keyof typeof errors] = validationError.message;
                validationErrors.push(validationError);
            }
        }
    });

    return {
        errors,
        validationErrors,
        isValid: validationErrors.length === 0
    };
};

const mapApiErrorsToForm = (apiErrors: Record<string, string[]>) => {
    const formErrors = { ...INITIAL_FORM_STATE };

    Object.entries(FIELD_CONFIG).forEach(([formKey, config]) => {
        if (apiErrors[config.apiField] && Array.isArray(apiErrors[config.apiField])) {
            let errorMessage = apiErrors[config.apiField][0];

            // Replace technical field names with user-friendly names
            Object.values(FIELD_CONFIG).forEach(field => {
                errorMessage = errorMessage.replace(
                    new RegExp(field.apiField, 'gi'),
                    field.displayName
                );
            });

            formErrors[formKey as keyof typeof formErrors] = errorMessage;
        }
    });

    return formErrors;
};

const prepareApiData = (formData: typeof INITIAL_FORM_STATE) => ({
    category_id: parseInt(formData.category),
    course_type_id: parseInt(formData.courseType),
    course_name: formData.name.trim(),
    course_card_title: formData.cardTitle.trim(),
    one_line_description: formData.description.trim(),
    title: formData.title.trim()
});

// Main Component
export const CreatingCourse: React.FC<CreateCourseProps> = ({
    courseCategoryList,
    courseTypeList,
    isOpen,
    onClose,
    onCourseCreated
}) => {
    const router = useRouter();
    const { invalidateRelatedCache } = useApiCache();
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [errors, setErrors] = useState(INITIAL_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const clearError = useCallback((field: keyof typeof INITIAL_FORM_STATE) => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    }, [errors]);

    const resetData = useCallback(() => {
        setFormData(INITIAL_FORM_STATE);
        setErrors(INITIAL_FORM_STATE);
        setIsSubmitting(false);
    }, []);

    // Auto-generate fields when title or course type changes
    const handleTitleChange = useCallback((title: string) => {
        setFormData(prev => {
            const updatedData = { ...prev, title };
            
            if (title.trim()) {
                
                // Auto-generate course name if course type is selected
                if (prev.courseType) {
                    updatedData.name = generateCourseName(prev.courseType, title, courseTypeList);
                }
            } else {
                // Clear generated fields if title is empty
                updatedData.name = '';
            }
            
            return updatedData;
        });
        clearError('title');
    }, [courseTypeList, clearError]);

    // Auto-generate course name when course type changes
    const handleCourseTypeChange = useCallback((courseTypeId: string) => {
        setFormData(prev => {
            const updatedData = { ...prev, courseType: courseTypeId };
            
            // Auto-generate course name if title is available
            if (prev.title.trim() && courseTypeId) {
                updatedData.name = generateCourseName(courseTypeId, prev.title, courseTypeList);
            } else if (!courseTypeId) {
                // Clear course name if no course type selected
                updatedData.name = '';
            }
            
            return updatedData;
        });
        clearError('courseType');
    }, [courseTypeList, clearError]);


    const handleSubmit = async () => {
        const { errors: validationErrors, isValid } = validateForm(formData);

        if (!isValid) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const apiData = prepareApiData(formData);
            console.log('Creating course with data:', apiData);

            const createdCourse = await CreateCourse(apiData);

            console.log('Course created successfully:', createdCourse);
            console.log('Course ID:', createdCourse.id, 'Course UUID:', createdCourse.uuid);

            // Invalidate courses cache immediately to ensure fresh data
            invalidateRelatedCache('courses');
            
            // Also invalidate any existing individual course caches
            if (createdCourse.id) {
                invalidateRelatedCache('all'); // Clear all cache to be safe
            }

            showToast('Course created successfully! Redirecting to course settings...','success');
            onCourseCreated?.();
            onClose();
            resetData();

            // Small delay to ensure cache invalidation completes before redirect
            setTimeout(() => {
                // Redirect to course settings page using numeric ID (system handles UUID internally)
                router.push(`/dashboard/courses/coursesettings?id=${createdCourse.id}`);
            }, 300);
        } catch (err) {
            console.error('Failed to create course:', err);

            const validationErr = err as APIValidationError;
            if (validationErr.isValidationError && validationErr.validationErrors) {
                const formErrors = mapApiErrorsToForm(validationErr.validationErrors);
                setErrors(formErrors);

                const hasConstraintError = Object.values(validationErr.validationErrors).some(errors =>
                    errors.some(error => error.includes('already exists') || error.includes('must be unique'))
                );

                showToast(hasConstraintError
                    ? 'Please fix the duplicate value(s) highlighted below.'
                    : 'Please correct the highlighted fields.'
                ,'error');
            } else {
                const errorMessage = err instanceof Error ? err.message : 'Failed to create course. Please try again.';
                showToast(errorMessage,'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        onClose();
        resetData();
    };

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            title="Create New Course"
            size="lg"
            footer={
                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primaryBtn"
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Course'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-3">
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category Type <span className="text-red-500">*</span>
                        </label>
                        <Select2
                            className={`w-full ${errors.category ? 'border-red-500' : ''}`}
                            value={formData.category}
                            options={[
                                { value: '', label: 'Select Category' },
                                ...courseCategoryList.map(cat => ({
                                    value: String(cat.id),
                                    label: cat.name
                                }))
                            ]}
                            onChange={(value: string | string[]) => {
                                const selectedValue = typeof value === 'string' ? value : '';
                                setFormData(prev => ({ ...prev, category: selectedValue }));
                                clearError('category');
                            }}
                            style={{ padding: '0.6rem' }}
                        />
                        {errors.category && (
                            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Course Type <span className="text-red-500">*</span>
                        </label>
                        <Select2
                            className={`w-full ${errors.courseType ? 'border-red-500' : ''}`}
                            value={formData.courseType}
                            options={[
                                { value: '', label: 'Select Course Type' },
                                ...courseTypeList.map(type => ({
                                    value: String(type.id),
                                    label: type.name
                                }))
                            ]}
                            onChange={(value: string | string[]) => {
                                const selectedValue = typeof value === 'string' ? value : '';
                                handleCourseTypeChange(selectedValue);
                            }}
                            style={{ padding: '0.6rem' }}
                        />
                        {errors.courseType && (
                            <p className="text-red-500 text-sm mt-1">{errors.courseType}</p>
                        )}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                        name="courseTitle"
                        placeholder="e.g., Medical Fundamentals"
                        value={formData.title}
                        onChange={(e) => {
                            handleTitleChange(e.target.value);
                        }}
                        className={`w-full ${errors.title ? 'border-red-500' : ''}`}
                    />
                    {errors.title && (
                        <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Course Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            name="courseName"
                            placeholder="e.g., Bachelor of Medicine and Surgery"
                            value={formData.name}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, name: e.target.value }));
                                clearError('name');
                            }}
                            className={`w-full ${errors.name ? 'border-red-500' : ''} ${formData.name && formData.title && formData.courseType ? 'bg-gray-50' : ''}`}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Course Card Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                            name="courseCardTitle"
                            placeholder="e.g., Learn Medical Basics"
                            value={formData.cardTitle}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, cardTitle: e.target.value }));
                                clearError('cardTitle');
                            }}
                            className={`w-full ${errors.cardTitle ? 'border-red-500' : ''}`}
                        />
                        {errors.cardTitle && (
                            <p className="text-red-500 text-sm mt-1">{errors.cardTitle}</p>
                        )}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        One Line Description <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                        name="courseDescription"
                        placeholder="Brief description of the course content and objectives..."
                        value={formData.description}
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, description: e.target.value }));
                            clearError('description');
                        }}
                        className={`w-full resize-none ${errors.description ? 'border-red-500' : ''}`}
                        rows={3}
                    />
                    {errors.description && (
                        <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};