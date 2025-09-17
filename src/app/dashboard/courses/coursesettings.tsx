"use client";
import { useState, useEffect } from "react";
import { Course } from "@/types/course";
import {Accordion,AccordionItem,AccordionTrigger,AccordionContent,} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCoursesCategory } from "@/lib/coursecategory-api";
import { CourseCategory } from "@/types/coursecategory";
import { getCoursesType } from "@/lib/coursetype-api";
import { CourseType } from "@/types/coursetype";
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Editor } from '@tinymce/tinymce-react';
interface CourseSettingsProps {
    courseData?: Course | null;
}

export default function CourseSettings({ courseData }: CourseSettingsProps) {
    const allItemIds = ["basic-course-information"];

    const [categories, setCategories] = useState<CourseCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [courseTypes, setCourseTypes] = useState<CourseType[]>([]);
    const [selectedCourseType, setSelectedCourseType] = useState("");

    const [openItems, setOpenItems] = useState<string[]>([]);
    const [formData, setFormData] = useState<Partial<Course>>({
        ...courseData,
    });

    // Fetch categories + course types together
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, courseTypesData] = await Promise.all([
                    getCoursesCategory(),
                    getCoursesType(),
                ]);

                setCategories(categoriesData);
                setCourseTypes(courseTypesData);

                // Prefill selections if editing an existing course
                if (courseData) {
                    const category = categoriesData.find(
                        (c) => c.id === Number(courseData.category)
                    );
                    if (category) setSelectedCategory(category.name);

                    const courseType = courseTypesData.find(
                        (ct) => ct.id === Number(courseData.course_type_id)
                    );
                    if (courseType) setSelectedCourseType(courseType.name);
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

    // Handle dropdown selections
    const handleCategorySelect = (categoryName: string) => {
        setSelectedCategory(categoryName);
        const cat = categories.find((c) => c.name === categoryName);
        if (cat) {
            setFormData((prev) => ({
                ...prev,
                category: cat.id.toString(),
            }));
        }
    };

    const handleCourseTypeSelect = (typeName: string) => {
        setSelectedCourseType(typeName);
        const ct = courseTypes.find((c) => c.name === typeName);
        if (ct) {
            setFormData((prev) => ({
                ...prev,
                course_type: ct.id.toString(),
            }));
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
                                    className="mt-1 mb-4"
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
                                <label className="text-lg font-medium m-2">Course Category</label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full gap-2 rounded-lg border-gray-300 text-left justify-between mt-1 mb-4"
                                        >
                                            <span className="truncate">
                                                {selectedCategory || "Select Category"}
                                            </span>
                                            <ChevronDown size={16} className="flex-shrink-0" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleCategorySelect("")}>
                                            Select Category
                                        </DropdownMenuItem>
                                        {categories.map((category) => (
                                            <DropdownMenuItem
                                                key={category.id}
                                                onClick={() => handleCategorySelect(category.name)}
                                            >
                                                {category.name}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Course Type</label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full gap-2 rounded-lg border-gray-300 text-left justify-between mt-1 mb-4"
                                        >
                                            <span className="truncate">
                                                {selectedCourseType || "Select Course Type"}
                                            </span>
                                            <ChevronDown size={16} className="flex-shrink-0" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleCourseTypeSelect("")}>
                                            Select Course Type
                                        </DropdownMenuItem>
                                        {courseTypes.map((type) => (
                                            <DropdownMenuItem
                                                key={type.id}
                                                onClick={() => handleCourseTypeSelect(type.name)}
                                            >
                                                {type.name}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                            </div>
                        </div>
                        <label className="text-lg font-medium m-2">Course Description</label>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
