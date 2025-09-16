"use client";
import { useState, useEffect } from "react";
import { Course } from "@/types/course";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
interface CourseSettingsProps {
    courseData?: Course | null;
}


export default function CourseSettings({ courseData }: CourseSettingsProps) {

    const [selectedCourseType, setSelectedCourseType] = useState("");

    // Removed unused courseId and courseDataState
    const allItemIds = ["basic-course-information", "item-2", "item-3"]

    const [openItems, setOpenItems] = useState<string[]>([])
    // Initialize form data with courseData and update when courseData changes
    const [formData, setFormData] = useState<Partial<Course>>({
        ...courseData
    })

    // Update formData when courseData changes
    useEffect(() => {
        if (courseData) {
            setFormData(courseData);
        }
    }, [courseData]);

    const toggleAll = () => {
        if (openItems.length === allItemIds.length) {
            setOpenItems([]) // collapse all
        } else {
            setOpenItems(allItemIds) // expand all
        }
    }
    // Removed unused effect for courseDataState

    return <div>
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
            <AccordionItem value="basic-course-information" className="border rounded-lg">
                <AccordionTrigger className="flex bg-[#e4e7eb] rounded-tl-lg rounded-tr-lg px-5">
                    <h2>Basic Course Information</h2>
                </AccordionTrigger>
                <AccordionContent className="px-5 py-3">
                    <label className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 m-2">
                        Course Card Title
                    </label>
                    <Input
                        type="text"
                        placeholder="Course Title"
                        className="mt-1 mb-2"
                        value={formData?.course_name || courseData?.course_name || ''}
                        onChange={(e) => setFormData({
                            ...formData,
                            course_name: e.target.value
                        })}
                    />
                    <div className="flex gap-4">
                        <div>
                            <label className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 m-2">
                                Course Type
                            </label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="flex-[4] gap-2 rounded-lg border-gray-300 text-left justify-between"
                                    >
                                        <span className="truncate">
                                            {selectedCourseType === "" ? "Select Course Type" : courseData?.course_type}
                                        </span>
                                        <ChevronDown size={16} className="flex-shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setSelectedCourseType("")}>
                                        Select Course Type
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                        </div>
                        <div>
                            <label className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 m-2">
                                Child Courses
                            </label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="flex-[4] gap-2 rounded-lg border-gray-300 text-left justify-between"
                                    >
                                        <span className="truncate">
                                            {selectedCourseType === "" ? "Select Course Type" : courseData?.course_type}
                                        </span>
                                        <ChevronDown size={16} className="flex-shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setSelectedCourseType("")}>
                                        Select Course Type
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>;
};

