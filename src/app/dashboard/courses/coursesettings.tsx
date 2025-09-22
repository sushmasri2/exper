"use client";
import { useState, useEffect } from "react";
import { Course } from "@/types/course";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCoursesCategory } from "@/lib/coursecategory-api";
import { CourseCategory } from "@/types/coursecategory";
import { getCoursesType } from "@/lib/coursetype-api";
import { CourseType } from "@/types/coursetype";
import { getEligibilities, getCourseEligibilities } from "@/lib/eligibility-api";
import { Eligibility } from "@/types/eligibility";
import Select2 from "@/components/ui/Select2";
import { getCourseKeywords } from "@/lib/keywords-api";

interface CourseSettingsProps {
    courseData?: Course | null;
}

export default function CourseSettings({ courseData }: CourseSettingsProps) {
    // Complete list of all accordion items
    const allItemIds = [
        "basic-course-information",
        "course-classification", 
        "visual-assets-media",
        "course-content-learning",
        "target-audience-marketing",
        "instructor-schedule",
        "platform-technical-settings",
        "support-resources",
        "analytics-metrics",
        "enrollment-access-control"
    ];

    const [categories, setCategories] = useState<CourseCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [courseTypes, setCourseTypes] = useState<CourseType[]>([]);
    const [selectedCourseType, setSelectedCourseType] = useState("");
    const [eligibilities, setEligibilities] = useState<Eligibility[]>([]);
    const [selectedEligibilities, setSelectedEligibilities] = useState<string[]>([]);

    const [openItems, setOpenItems] = useState<string[]>([]);
    const [formData, setFormData] = useState<Partial<Course>>({
        ...courseData,
    });
    // State for keywords
    const [keywords, setKeywords] = useState<string>("");

    // Fetch categories, course types, and eligibilities
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, courseTypesData, eligibilitiesData] = await Promise.all([
                    getCoursesCategory(),
                    getCoursesType(),
                    getEligibilities()
                ]);

                setCategories(categoriesData);
                setCourseTypes(courseTypesData);
                setEligibilities(eligibilitiesData);

                // Prefill selections if editing an existing course
                if (courseData) {
                    const category = categoriesData.find(
                        (c) => c.id === Number(courseData.category_id)
                    );
                    if (category) setSelectedCategory(category.name);

                    const courseType = courseTypesData.find(
                        (ct) => ct.id === Number(courseData.course_type_id)
                    );
                    if (courseType) setSelectedCourseType(courseType.name);

                    // Fetch course-specific data if UUID exists
                    if (courseData.uuid) {
                        try {
                            // Fetch selected eligibilities for this course
                            const courseEligibilities = await getCourseEligibilities(courseData.uuid);
                            if (Array.isArray(courseEligibilities)) {
                                // Make sure the IDs are strings to match Select2 option values
                                setSelectedEligibilities(courseEligibilities.map(e => e.uuid.toString()));
                            } else {
                                console.warn("Course eligibilities response is not an array:", courseEligibilities);
                                setSelectedEligibilities([]);
                            }

                            // Fetch keywords for this course
                            const keywordList = await getCourseKeywords(courseData.uuid);
                            if (Array.isArray(keywordList)) {
                                setKeywords(keywordList
                                    .map(k => k?.keyword_text || '')
                                    .filter(text => text.length > 0)
                                    .join(", ")
                                );
                            } else {
                                console.warn("Course keywords response is not an array:", keywordList);
                                setKeywords("");
                            }
                        } catch (err) {
                            console.error("Error fetching course-specific data:", err);
                            setSelectedEligibilities([]);
                            setKeywords("");
                        }
                    }
                } else {
                    // Reset states for new course creation
                    setSelectedCategory("");
                    setSelectedCourseType("");
                    setSelectedEligibilities([]);
                    setKeywords("");
                }
            } catch (err) {
                console.error("Error fetching initial data:", err);
            }
        };

        fetchData();
    }, [courseData]);

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

    return (
        <div>
            <div className="flex gap-2 mb-4 justify-end">
                <Button onClick={toggleAll}>
                    {openItems.length === allItemIds.length ? "Collapse All" : "Expand All"}
                </Button>
            </div>

            <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
                <AccordionItem value="basic-course-information" className="border rounded-lg">
                    <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                        <h2>Basic Course Information</h2>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 py-3">
                        {/* Course Title */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="text-lg font-medium m-2">Course Card Title</label>
                                <Input
                                    type="text"
                                    placeholder="Course Title"
                                    className="mb-4 px-3 py-0"
                                    value={formData?.course_name || ""}
                                    onChange={(e) => handleInputChange('course_name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Child Course</label>
                                <Select2
                                    options={[
                                        { label: 'Select Child Course', value: '' },
                                    ]}
                                    value={typeof formData.child_course === 'string' ? formData.child_course : ''}
                                    onChange={val => {
                                        if (typeof val === 'string') {
                                            handleInputChange('child_course', val);
                                        }
                                    }}
                                    placeholder="Select Child Course"
                                    style={{ padding: '0.6rem' }}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Course Type</label>
                                <Select2
                                    options={courseTypes.length > 0 ? [{ label: 'Select Course Type', value: '' }, ...courseTypes.map(type => ({ label: type.name, value: type.id.toString() }))] : [{ label: 'Select Course Type', value: '' }]}
                                    value={selectedCourseType === '' ? '' : courseTypes.find(ct => ct.name === selectedCourseType)?.id.toString() || ''}
                                    onChange={val => {
                                        if (typeof val === 'string') {
                                            setSelectedCourseType(courseTypes.find(ct => ct.id.toString() === val)?.name || '');
                                            handleInputChange('course_type_id', val);
                                        }
                                    }}
                                    placeholder="Select Course Type"
                                    style={{ padding: '0.6rem' }}
                                />
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <label className="text-lg font-medium m-2">One Line Description</label>
                            <Input
                                type="text"
                                placeholder="Brief one-line description"
                                className="mb-4 px-3 py-0"
                                value={formData?.one_line_description || ""}
                                onChange={(e) => handleInputChange('one_line_description', e.target.value)}
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="text-lg font-medium m-2">Description</label>
                            <Textarea
                                placeholder="Course description"
                                className="mb-4 px-3 py-2"
                                value={formData?.description || ""}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={4}
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="text-lg font-medium m-2">Course Summary</label>
                            <Textarea
                                placeholder="Course summary"
                                className="mb-4 px-3 py-2"
                                value={typeof formData?.summary === "string" ? formData.summary : ""}
                                onChange={(e) => handleInputChange('summary', e.target.value)}
                                rows={3}
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="course-classification" className="border rounded-lg mt-3">
                    <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                        <h2>Course Classification</h2>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 py-3">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-lg font-medium m-2">Course Eligibility</label>
                                <Select2
                                    options={eligibilities.length > 0 ?
                                        eligibilities.map(eligibility => ({
                                            label: eligibility.name,
                                            value: eligibility.uuid.toString()
                                        }))
                                        : []
                                    }
                                    value={selectedEligibilities}
                                    onChange={val => {
                                        if (Array.isArray(val)) {
                                            setSelectedEligibilities(val);
                                            handleInputChange('eligibility_ids', val);
                                        }
                                    }}
                                    multiple={true}
                                    placeholder="Select Eligibilities"
                                    style={{ padding: '0.6rem' }}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Course Category</label>
                                <Select2
                                    options={categories.length > 0 ? [{ label: 'Select Category', value: '' }, ...categories.map(cat => ({ label: cat.name, value: cat.id.toString() }))] : [{ label: 'Select Category', value: '' }]}
                                    value={selectedCategory === '' ? '' : categories.find(cat => cat.name === selectedCategory)?.id.toString() || ''}
                                    onChange={val => {
                                        if (typeof val === 'string') {
                                            setSelectedCategory(categories.find(cat => cat.id.toString() === val)?.name || '');
                                            handleInputChange('category_id', val);
                                        }
                                    }}
                                    placeholder="Select Category"
                                    style={{ padding: '0.6rem' }}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Keywords</label>
                                <Input
                                    type="text"
                                    placeholder="Keywords (comma separated)"
                                    className="mb-4 px-3 py-0"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Specialty Type</label>
                                <Input
                                    type="text"
                                    placeholder="Specialty Type"
                                    className="mb-4 px-3 py-0"
                                    value={typeof formData?.specialty_type === "string" ? formData.specialty_type : ""}
                                    onChange={(e) => handleInputChange('specialty_type', e.target.value)}
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem className="border rounded-lg mt-3" value="visual-assets-media">
                    <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                        <h2>Visual Assets & Media</h2>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 py-3">
                        {/* Add visual assets fields here */}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem className="border rounded-lg mt-3" value="course-content-learning">
                    <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                        <h2>Course Content & Learning</h2>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 py-3">
                        <div className="mb-4">
                            <label className="text-lg font-medium m-2">Special Features</label>
                            <Textarea
                                placeholder="Special features of the course"
                                className="mb-4 px-3 py-2"
                                value={typeof formData?.special_features === "string" ? formData.special_features : ""}
                                onChange={(e) => handleInputChange('special_features', e.target.value)}
                                rows={3}
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="text-lg font-medium m-2">What You Will Gain</label>
                            <Textarea
                                placeholder="What students will gain from this course"
                                className="mb-4 px-3 py-2"
                                value={typeof formData?.learning_outcomes === "string" ? formData.learning_outcomes : ""}
                                onChange={(e) => handleInputChange('learning_outcomes', e.target.value)}
                                rows={3}
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="text-lg font-medium m-2">Disclosure</label>
                            <Textarea
                                placeholder="Course disclosure information"
                                className="mb-4 px-3 py-2"
                                value={typeof formData?.disclosure === "string" ? formData.disclosure : ""}
                                onChange={(e) => handleInputChange('disclosure', e.target.value)}
                                rows={3}
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="text-lg font-medium m-2">Cohort Learning</label>
                            <Select2
                                options={[
                                    { label: 'Select Cohort Learning', value: '' },
                                    { label: 'Yes', value: 'true' },
                                    { label: 'No', value: 'false' }
                                ]}
                                value={formData?.cohort_learning?.toString() || ''}
                                onChange={val => {
                                    if (typeof val === 'string') {
                                        handleInputChange('cohort_learning', val === 'true');
                                    }
                                }}
                                placeholder="Enable cohort learning?"
                                style={{ padding: '0.6rem' }}
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem className="border rounded-lg mt-3" value="target-audience-marketing">
                    <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                        <h2>Target Audience & Marketing</h2>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 py-3">
                        {/* Add target audience fields here */}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem className="border rounded-lg mt-3" value="instructor-schedule">
                    <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                        <h2>Instructor & Schedule</h2>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 py-3">
                        {/* Add instructor and schedule fields here */}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem className="border rounded-lg mt-3" value="platform-technical-settings">
                    <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                        <h2>Platform & Technical Settings</h2>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 py-3">
                        {/* Add platform settings fields here */}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem className="border rounded-lg mt-3" value="support-resources">
                    <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                        <h2>Support & Resources</h2>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 py-3">
                        {/* Add support resources fields here */}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem className="border rounded-lg mt-3" value="analytics-metrics">
                    <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                        <h2>Analytics & Metrics</h2>
                        </AccordionTrigger>
                        <AccordionContent className="px-5 py-3">
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem className="border rounded-lg mt-3" value="enrollment-access-control">
                    <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                        <h2>Enrollment & Access Control</h2>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 py-3">
                        {/* Add enrollment fields here */}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            
            <div className="flex justify-end">
                <Button className="mt-4" variant="secondary">Save as Draft</Button>
                <Button className="mt-4 ml-2" variant="courseCreate">Publish Course</Button>
            </div>
        </div>
    );
}