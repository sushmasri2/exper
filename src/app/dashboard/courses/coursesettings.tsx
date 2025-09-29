"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Course } from "@/types/course";
import { useCourseSettingsData } from "./hooks/useCourseSettingsData";
import { ValidationError } from "./utils/validation";
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
    const [formData, setFormData] = useState<Partial<Course>>({
        ...courseData,
    });

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

    const handleInputChange = (
        field: keyof Course,
        value: string | number | boolean | string[]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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

    // Handle publish/update course button click
    const handlePublishUpdate = () => {
        
        // Validate all form data
        const validationResult = actions.validation.validateForm(formData, data.courseSettings || undefined);
        
        if (!validationResult.isValid) {
            console.error("Validation failed with errors:", validationResult.errors);
            
            // Focus on first error field
            focusOnFirstError(validationResult.errors);
            
            // Display error summary in console for debugging
            console.log("Validation errors by field:");
            validationResult.errors.forEach(error => {
                console.log(`- ${error.field}: ${error.message}`);
            });
            
            return;
        }
        
        // If validation passes, show success message
        console.log("✅ Validation passed! Course data is valid.");
        console.log("Form data:", formData);
        console.log("Course settings:", data.courseSettings);
        
        // Here you would typically call the API to save/update the course
        // For now, just log success
        if (!courseData) {
            console.log("🚀 Course would be published successfully!");
        } else {
            console.log("✏️ Course would be updated successfully!");
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
                <Button className="mt-4" variant="secondary">Save as Draft</Button>
                <Button 
                    className="mt-4 ml-2" 
                    variant="courseCreate"
                    onClick={handlePublishUpdate}
                >
                    {!courseData ? "Publish Course" : "Update Course"}
                </Button>
            </div>
        </div>
    );
}