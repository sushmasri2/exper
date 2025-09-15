"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Course } from "@/types/course";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export default function CourseSettings() {
    const searchParams = useSearchParams();
    const courseId = searchParams.get('id');
    const [courseData, setCourseData] = useState<Course | null>(null);

    const allItemIds = ["basic-course-information", "item-2", "item-3"]

    const [openItems, setOpenItems] = useState<string[]>([])

    const toggleAll = () => {
        if (openItems.length === allItemIds.length) {
            setOpenItems([]) // collapse all
        } else {
            setOpenItems(allItemIds) // expand all
        }
    }
    useEffect(() => {
        if (!courseId) return;

        async function fetchCourse() {
            try {
                const res = await fetch(`/api/courses/${courseId}`);

                if (!res.ok) {
                    throw new Error('Failed to fetch course');
                }

                const response = await res.json();

                if (response.success && response.data) {

                    setCourseData(response.data);
                } else {
                    console.error('API response structure issue:', response);
                    throw new Error(response.message || 'Course not found');
                }
            } catch (error) {
                console.error('Error fetching course:', error);
            }
        }

        fetchCourse();
    }, [courseId]);

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
                    <Input type="text" placeholder="Course Title" className="mt-1 mb-2" value={courseData?.course_name || ''} />
                    <div className="gid grid-cols-2 gap-4">
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
                                            Select Course
                                        </span>
                                        <ChevronDown size={16} className="flex-shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent>
                                    <DropdownMenuItem>
                                        Select Course
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        Select Course
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
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
                                            Select Course
                                        </span>
                                        <ChevronDown size={16} className="flex-shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent>
                                    <DropdownMenuItem>
                                        Select Course
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        Select Course
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

