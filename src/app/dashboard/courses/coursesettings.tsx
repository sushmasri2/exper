"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Course } from "@/types/course";
import { useCourseSettingsData } from "./hooks/useCourseSettingsData";
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
                <Button className="mt-4 ml-2" variant="courseCreate">
                    {!courseData ? "Publish Course" : "Update Course"}
                </Button>
            </div>
        </div>
    );
}