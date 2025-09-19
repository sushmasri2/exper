"use client";
import { useState, useEffect } from "react";
import { Course } from "@/types/course";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCoursesCategory } from "@/lib/coursecategory-api";
import { CourseCategory } from "@/types/coursecategory";
import { getCoursesType } from "@/lib/coursetype-api";
import { CourseType } from "@/types/coursetype";
import { getAllEligibilities } from "@/lib/eligibility-api";
import { Eligibility } from "@/types/eligibility";
import Select2 from "@/components/ui/Select2";
interface CourseSettingsProps {
    courseData?: Course | null;
}

export default function CourseSettings({ courseData }: CourseSettingsProps) {
    const allItemIds = ["basic-course-information", "course-classification"];

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

    // Fetch categories + course types + eligibilities together
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, courseTypesData, eligibilitiesData] = await Promise.all([
                    getCoursesCategory(),
                    getCoursesType(),
                    getAllEligibilities(),
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

                    // Handle eligibility selections if they exist in the course data
                    if (courseData.eligibility) {
                        // Assuming eligibility could be a string of comma-separated IDs or an array
                        const eligibilityIds = typeof courseData.eligibility === 'string' 
                            ? courseData.eligibility.split(',').map(id => id.trim())
                            : Array.isArray(courseData.eligibility) 
                                ? courseData.eligibility.map(String)
                                : [];
                        setSelectedEligibilities(eligibilityIds);
                    }
                }
            } catch (err) {
                console.error("Error fetching data:", err);
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

    return (
        <div>
            <div className="flex gap-2 mb-4 justify-end">
                <Button onClick={toggleAll}>
                    {openItems.length === allItemIds.length ? "Collapse All" : "Expand All"}
                </Button>
            </div>

            <Accordion
                type="multiple"
                value={openItems}
                onValueChange={setOpenItems}
                className="w-full"
            >
                <AccordionItem
                    value="basic-course-information"
                    className="border rounded-lg"
                >
                    <AccordionTrigger className="flex bg-[#e4e7eb]  px-5">
                        <h2>Basic Course Information</h2>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 py-3">
                        {/* Course Title */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-lg font-medium m-2">Course Card Title</label>
                                <Input
                                    type="text"
                                    placeholder="Course Title"
                                    className="mb-4 px-3 py-0"
                                    value={courseData?.course_name || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            course_name: e.target.value,
                                        })
                                    }
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
                                            setFormData(prev => ({ ...prev, child_course: val }));
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
                                            setFormData(prev => ({ ...prev, course_type: val }));
                                        }
                                    }}
                                    placeholder="Select Course Type"
                                    style={{ padding: '0.6rem' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-lg font-medium m-2">One Line Description</label>

                        </div>
                        <div>
                            <label className="text-lg font-medium m-2">Description</label>

                        </div>
                        <div>
                            <label className="text-lg font-medium m-2">Course Summary</label>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem
                    value="course-classification"
                    className="border rounded-lg mt-3">
                    <AccordionTrigger className="flex bg-[#e4e7eb]  px-5">
                        <h2>Course Classification</h2>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 py-3">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-lg font-medium m-2">Course Eligibility</label>
                                <Select2
                                    multiple={true}
                                    options={eligibilities.length > 0 
                                        ? eligibilities
                                            .filter(eligibility => eligibility && eligibility.eligibility_criteria && eligibility.id)
                                            .map(eligibility => ({ 
                                                label: eligibility.eligibility_criteria, 
                                                value: eligibility.id 
                                            }))
                                        : []
                                    }
                                    value={selectedEligibilities}
                                    onChange={(val) => {
                                        if (Array.isArray(val)) {
                                            setSelectedEligibilities(val);
                                            setFormData(prev => ({ 
                                                ...prev, 
                                                eligibility: val.join(',') // Store as comma-separated string
                                            }));
                                        }
                                    }}
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
                                            setFormData(prev => ({ ...prev, category: val }));
                                        }
                                    }}
                                    placeholder="Select Category"
                                    style={{ padding: '0.6rem' }}
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
