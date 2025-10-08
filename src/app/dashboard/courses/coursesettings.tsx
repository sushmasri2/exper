"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Course } from "@/types/course";
import { CourseSettingsPartialFormData } from "@/types/course-settings-form";
import { useCourseSettingsData } from "./hooks/useCourseSettingsData";
import { ValidationError } from "./utils/validation";
import { success, error } from "@/lib/toast";
import CourseInformation from "./components/coursesetting/CourseInformation";
import VisualAssets from "./components/coursesetting//VisualAssets";
import CourseContent from "./components/coursesetting//CourseContent";
import CourseAdministration from "./components/coursesetting//CourseAdministration";
import AccreditationCompliance from "./components/coursesetting//AccreditationCompliance";
import AnalyticsAccessControl from "./components/coursesetting//AnalyticsAccessControl";

interface CourseSettingsProps {
    courseData?: Course | null;
}

export default function CourseSettings({ courseData }: CourseSettingsProps) {
    // Complete list of all accordion items
    const allItemIds = [
        "course-information",
        "visual-assets-media",
        "course-content-support",
        "course-administration",
        "accreditation-compliance",
        "analytics-access-control",
    ];


    const [openItems, setOpenItems] = useState<string[]>([]);
    const [formData, setFormData] = useState<CourseSettingsPartialFormData>({
        // Start with empty form data - only include user interactions
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Use the custom hook for data fetching
    const [data, actions] = useCourseSettingsData(courseData);

    // Toggle all accordion sections
    const toggleAll = () => {
        if (openItems.length === allItemIds.length) {
            setOpenItems([]); // collapse all
        } else {
            setOpenItems(allItemIds); // expand all
        }
    };

    // Function to check if there are any changes from original data
    const checkForChanges = useCallback((newFormData: CourseSettingsPartialFormData) => {
        if (!courseData) {
            // For new courses, any non-empty field is considered a change
            const hasAnyData = Object.values(newFormData).some(value => 
                value !== null && value !== undefined && value !== '' && 
                (Array.isArray(value) ? value.length > 0 : true)
            );
            return hasAnyData;
        }

        // For existing courses, compare with original data
        const originalData = { ...courseData };
        
        // Check if any field has changed
        for (const [key, value] of Object.entries(newFormData)) {
            const originalValue = originalData[key as keyof Course];
            if (value !== originalValue) {
                return true;
            }
        }
        
        return false;
    }, [courseData]);

    // Don't automatically merge any data - let formData remain empty until user interactions
    // The form components will display existing data using fallback patterns like:
    // value={formData.field || courseData?.field || ""}
    // This way we can distinguish between user interactions and display data

    // Check for initial changes when component mounts or data changes
    useEffect(() => {
        const initialChanges = checkForChanges(formData);
        setHasChanges(initialChanges);
    }, [formData, courseData, checkForChanges]);

    const handleInputChange = (
        field: keyof CourseSettingsPartialFormData,
        value: string | number | boolean | string[]
    ) => {
        // Clear any existing validation error for this field when user starts typing
        const fieldName = String(field);
        
        if (actions.validation.hasFieldError(fieldName)) {
            actions.validation.clearFieldError(fieldName);
        }

        const updatedFormData = { ...formData, [field]: value };
        setFormData(updatedFormData);
        
        // Check for changes and update hasChanges state
        const changesDetected = checkForChanges(updatedFormData);
        setHasChanges(changesDetected);
    };

    // Helper function to determine what's being updated for better button text
    const getUpdateButtonText = () => {
        if (isUpdating) {
            return !courseData ? "Publishing..." : "Updating...";
        }
        
        if (!hasChanges) {
            return !courseData ? "No Changes to Publish" : "No Changes";
        }
        
        if (!courseData) {
            return "Publish Course";
        }
        
        return "Update Course";
    };

    // Map fields to their accordion sections for focusing
    const fieldToAccordionMap: Record<string, string> = {
        'course_name': 'course-information',
        'one_line_description': 'course-information',
        'description': 'course-information',
        'summary': 'course-information',
        'category_id': 'course-information',
        'course_type_id': 'course-information',
        'speciality_type': 'course-information',
        'banner': 'visual-assets-media',
        'banner_alt_tag': 'visual-assets-media',
        'thumbnail_web': 'visual-assets-media',
        'thumbnail_mobile': 'visual-assets-media',
        'overview': 'course-content-support',
        'what_you_will_learn': 'course-content-support',
        'course_demo_url': 'course-content-support',
        'course_demo_mobile_url': 'course-content-support',
        'duration_years': 'course-administration',
        'duration_months': 'course-administration',
        'duration_days': 'course-administration',
        'course_start_date': 'course-administration',
        'end_date': 'course-administration',
        'schedule': 'course-administration',
        'w_days': 'course-administration',
        'accreditation': 'accreditation-compliance',
        'financial_aid': 'accreditation-compliance',
        'is_kyc_required': 'analytics-access-control',
        'enable_contact_programs': 'analytics-access-control'
    };

    // Focus on the first field with error
    const focusOnFirstError = (errors: ValidationError[]) => {
        if (errors.length === 0) return;

        const firstError = errors[0];
        const accordionSection = fieldToAccordionMap[firstError.field];

        if (accordionSection) {
            // Expand the accordion section if it's not already open
            if (!openItems.includes(accordionSection)) {
                setOpenItems(prev => [...prev, accordionSection]);
            }

            // Wait for accordion to expand, then focus and scroll to the field
            setTimeout(() => {
                const fieldElement = document.querySelector(`[name="${firstError.field}"], [id="${firstError.field}"]`) as HTMLElement;
                if (fieldElement) {
                    fieldElement.focus();
                    fieldElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });

                    // Add a visual highlight effect
                    fieldElement.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.5)';
                    setTimeout(() => {
                        fieldElement.style.boxShadow = '';
                    }, 3000);
                }
            }, 300);
        }
    };

    // Get form data for validation (only fields user has interacted with)
    const getFormDataForValidation = useCallback((): CourseSettingsPartialFormData => {
        // Only include fields that are actually in formData (user has modified)
        // Don't automatically add dropdown values unless user specifically changed them
        const validationData = { ...formData };
        
        console.log('📋 Raw formData for validation:', formData);
        console.log('📋 Keys in formData:', Object.keys(formData));
        
        return validationData;
    }, [formData]);

    // Get complete data for API submission (includes all displayed values)
    const getCompleteFormData = useCallback((): CourseSettingsPartialFormData => {
        const completeData = { ...formData };
        
        // Add all displayed values for API submission
        // Course Information fields
        if (!completeData.course_name && courseData?.course_name) {
            completeData.course_name = courseData.course_name;
        }
        if (!completeData.course_card_title && courseData?.course_card_title) {
            completeData.course_card_title = courseData.course_card_title;
        }
        if (!completeData.title && courseData?.title) {
            completeData.title = courseData.title;
        }
        if (!completeData.short_code && courseData?.short_code) {
            completeData.short_code = courseData.short_code;
        }
        if (!completeData.course_code && courseData?.course_code && typeof courseData.course_code === 'string') {
            completeData.course_code = courseData.course_code;
        }
        if (!completeData.one_line_description && courseData?.one_line_description) {
            completeData.one_line_description = courseData.one_line_description;
        }
        
        // Add course settings data if available
        if (data.courseSettings) {
            if (!completeData.overview && data.courseSettings.overview) {
                completeData.overview = data.courseSettings.overview;
            }
            if (!completeData.course_demo_url && data.courseSettings.course_demo_url) {
                completeData.course_demo_url = data.courseSettings.course_demo_url;
            }
            if (!completeData.course_demo_mobile_url && data.courseSettings.course_demo_mobile_url) {
                completeData.course_demo_mobile_url = data.courseSettings.course_demo_mobile_url;
            }
            if (!completeData.banner_alt_tag && data.courseSettings.banner_alt_tag) {
                completeData.banner_alt_tag = data.courseSettings.banner_alt_tag;
            }
            if (!completeData.schedule && data.courseSettings.schedule) {
                completeData.schedule = data.courseSettings.schedule;
            }
            if ((completeData.w_days === undefined || completeData.w_days === null) && data.courseSettings.w_days) {
                completeData.w_days = data.courseSettings.w_days;
            }
            if (completeData.is_preferred_course === undefined && data.courseSettings.is_preferred_course !== undefined) {
                completeData.is_preferred_course = data.courseSettings.is_preferred_course;
            }
            if (completeData.is_kyc_required === undefined && data.courseSettings.is_kyc_required !== undefined) {
                completeData.is_kyc_required = data.courseSettings.is_kyc_required;
            }
            if (completeData.enable_contact_programs === undefined && data.courseSettings.enable_contact_programs !== undefined) {
                completeData.enable_contact_programs = data.courseSettings.enable_contact_programs;
            }
            if (completeData.enable_index_tag === undefined && data.courseSettings.enable_index_tag !== undefined) {
                completeData.enable_index_tag = data.courseSettings.enable_index_tag;
            }
        }
        
        // Add selected dropdown values
        if (data.selectedCategory && !completeData.category_id) {
            const category = data.categories.find(cat => cat.name === data.selectedCategory);
            if (category) {
                completeData.category_id = category.id;
            }
        }
        if (data.selectedCourseType && !completeData.course_type_id) {
            const courseType = data.courseTypes.find(ct => ct.name === data.selectedCourseType);
            if (courseType) {
                completeData.course_type_id = courseType.id;
            }
        }
        
        // Preserve existing IDs from courseData
        if (!completeData.category_id && courseData?.category_id) {
            completeData.category_id = courseData.category_id;
        }
        if (!completeData.course_type_id && courseData?.course_type_id) {
            completeData.course_type_id = courseData.course_type_id;
        }
        
        // Convert data types to match backend expectations
        const transformedData = { ...completeData };
        
        // Helper function to convert to boolean
        const toBoolean = (value: unknown): boolean => {
            return value === '1' || value === 1 || value === 'true' || value === true;
        };
        
        // Helper function to convert to integer
        const toInteger = (value: unknown): number | undefined => {
            if (value && typeof value === 'string' && !isNaN(Number(value))) {
                return parseInt(value, 10);
            }
            if (typeof value === 'number') {
                return Math.floor(value);
            }
            return undefined;
        };

        // Transform boolean fields
        if (transformedData.is_preferred_course !== undefined) {
            (transformedData as Record<string, unknown>).is_preferred_course = toBoolean(transformedData.is_preferred_course);
        }
        if (transformedData.is_kyc_required !== undefined) {
            (transformedData as Record<string, unknown>).is_kyc_required = toBoolean(transformedData.is_kyc_required);
        }
        if (transformedData.enable_contact_programs !== undefined) {
            (transformedData as Record<string, unknown>).enable_contact_programs = toBoolean(transformedData.enable_contact_programs);
        }
        if (transformedData.enable_index_tag !== undefined) {
            (transformedData as Record<string, unknown>).enable_index_tag = toBoolean(transformedData.enable_index_tag);
        }

        // Transform numeric fields
        const numericResult = toInteger(transformedData.w_week);
        if (numericResult !== undefined) {
            (transformedData as Record<string, unknown>).w_week = numericResult;
        }

        // Ensure w_days is always a string (comma-separated)
        if (transformedData.w_days !== undefined) {
            const wDaysValue = transformedData.w_days;
            console.log('🔍 w_days before transformation:', wDaysValue, 'type:', typeof wDaysValue);
            
            if (Array.isArray(wDaysValue)) {
                (transformedData as Record<string, unknown>).w_days = wDaysValue.join(',');
                console.log('✅ w_days converted from array to string:', wDaysValue.join(','));
            } else if (typeof wDaysValue !== 'string') {
                (transformedData as Record<string, unknown>).w_days = String(wDaysValue);
                console.log('✅ w_days converted to string:', String(wDaysValue));
            } else {
                console.log('✅ w_days is already a string:', wDaysValue);
            }
        } else {
            console.log('⚠️ w_days is undefined');
        }

        return transformedData;
    }, [formData, courseData, data]);

    // Handle publish/update course button click
    const handlePublishUpdate = async () => {
        if (isUpdating) return; // Prevent multiple submissions
        
        setIsUpdating(true);
        
        try {
            // Get data for validation (only user-modified fields)
            const validationFormData = getFormDataForValidation();
            console.log('🔍 Validation data (user interactions only):', validationFormData);
            console.log('🔍 Validation data keys:', Object.keys(validationFormData));
            
            // Get complete form data for API submission (all displayed values)
            const completeFormData = getCompleteFormData();
            console.log('🔍 Complete data (for API submission):', Object.keys(completeFormData));
            
            // Skip validation if user hasn't made any changes to existing course
            const hasUserInteractions = Object.keys(validationFormData).length > 0;
            let result;
            
            if (!hasUserInteractions && courseData) {
                // For existing courses with no user changes, skip validation
                console.log('📋 No user interactions detected, skipping validation for existing course');
                result = await actions.updateCourseData(completeFormData);
            } else {
                // Use validation data for validation, complete data for submission
                result = await actions.updateCourseData(completeFormData);
            }

            if (!result.isValid || !result.success) {
                console.error("❌ Update failed with errors:", result.errors);
                // Debug log for troubleshooting
                console.log("� FormData validation errors:", result.errors.map(err => `${err.field}: ${err.message}`));

                // Set validation errors in the form validation system
                actions.validation.setErrors(result.errors);

                // Show error toast with first error message
                const firstError = result.errors[0];
                if (firstError) {
                    error(`${firstError.message}`);
                } else {
                    error("Please fix the validation errors and try again.");
                }

                // Focus on first error field
                focusOnFirstError(result.errors);

                // Display error summary in console for debugging
                console.log("Validation/Update errors by field:");
                result.errors.forEach(err => {
                    console.log(`- ${err.field}: ${err.message}`);
                });

                return;
            }

            // If update succeeds, show success message
            console.log("✅ Course updated successfully!");
            console.log("Updated data:", result.data);

            // Clear any existing validation errors since update was successful
            actions.validation.clearErrors();

            if (!courseData) {
                console.log("🚀 Course published successfully!");
                success("Course published successfully!");
            } else {
                console.log("✏️ Course updated successfully!");
                success("Course updated successfully!");
            }
            
            // TODO: Optionally redirect to course list or refresh current data

        } catch (err) {
            console.error("❌ Unexpected error during update:", err);
            error("An error occurred while updating the course. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    // Show loading state
    if (data.isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading course settings...</div>
            </div>
        );
    }

    // Show error state
    if (data.error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-red-600">Error: {data.error}</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex gap-2 mb-4 justify-end">
                <Button onClick={toggleAll}>
                    {openItems.length === allItemIds.length ? "Collapse All" : "Expand All"}
                </Button>
            </div>

            <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
                <AccordionItem className="border rounded-lg" value="course-information">
                    <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                        <h2>Course Information</h2>
                    </AccordionTrigger>
                    <AccordionContent>
                        <CourseInformation
                            courseData={courseData}
                            formData={formData}
                            data={data}
                            actions={actions}
                            onInputChange={handleInputChange}
                        />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem className="border rounded-lg mt-3" value="visual-assets-media">
                    <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                        <h2>Visual Assets & Media</h2>
                    </AccordionTrigger>
                    <AccordionContent>
                        <VisualAssets
                            courseData={courseData}
                            formData={formData}
                            data={data}
                            actions={actions}
                            onInputChange={handleInputChange}
                        />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem className="border rounded-lg mt-3" value="course-content-support">
                    <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                        <h2>Course Content & Support</h2>
                    </AccordionTrigger>
                    <AccordionContent>
                        <CourseContent
                            courseData={courseData}
                            formData={formData}
                            data={data}
                            actions={actions}
                            onInputChange={handleInputChange}
                        />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem className="border rounded-lg mt-3" value="course-administration">
                    <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                        <h2>Course Administration</h2>
                    </AccordionTrigger>
                    <AccordionContent>
                        <CourseAdministration
                            courseData={courseData}
                            formData={formData}
                            data={data}
                            actions={actions}
                            onInputChange={handleInputChange}
                        />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem className="border rounded-lg mt-3" value="accreditation-compliance">
                    <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                        <h2>Accreditation & Compliance</h2>
                    </AccordionTrigger>
                    <AccordionContent>
                        <AccreditationCompliance
                            courseData={courseData}
                            formData={formData}
                            data={data}
                            actions={actions}
                            onInputChange={handleInputChange}
                        />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem className="border rounded-lg mt-3" value="analytics-access-control">
                    <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                        <h2>Analytics & Access Control</h2>
                    </AccordionTrigger>
                    <AccordionContent>
                        <AnalyticsAccessControl
                            courseData={courseData}
                            formData={formData}
                            data={data}
                            actions={actions}
                            onInputChange={handleInputChange}
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="flex justify-end">
                <Button
                    className="mt-4 ml-2"
                    variant="primaryBtn"
                    onClick={handlePublishUpdate}
                    disabled={isUpdating || !hasChanges}
                >
                    {getUpdateButtonText()}
                </Button>
            </div>
        </div>
    );
}