"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { PageLoading } from "@/components/ui/loading-spinner";
import { Course } from "@/types/course";
import { GetCourseByIdDirect } from "@/lib/courses-api";
import CourseSections from "../components/sectionsstructure"; // adjust path

export default function BuilderStructurePage() {
    const searchParams = useSearchParams();
    const courseId = searchParams.get('id');
    const [courseData, setCourseData] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [isToggled, setIsToggled] = useState(false);

    useEffect(() => {
        if (!courseId) {
            console.log("No courseId provided");
            setCourseData(null);
            setLoading(false);
            return;
        }

        console.log(`Fetching course data for ID: ${courseId}`);

        const fetchCourseData = async () => {
            try {
                // Call API to get course details using UUID/ID
                const numericCourseId = Number(courseId);
                const course = await GetCourseByIdDirect(numericCourseId);

                if (course) {
                    setCourseData(course);
                } else {
                    setCourseData(null);
                }
            } catch (error) {
                console.error("Error fetching course data:", error);
                setCourseData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId]);

    if (loading) return <PageLoading />;
    if (!courseId) return <div>No course ID provided</div>;

    return (
        <div className="border rounded-lg shadow-sm bg-white">
            <div className="p-4 bg-[linear-gradient(90deg,#4F46E5,#7C3AED)] text-white rounded-t-lg flex items-center justify-between">
                <h1 className="text-xl font-semibold">{courseData?.course_name || "Course Details"}</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsToggled(!isToggled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 ${
                            isToggled ? 'bg-white' : 'bg-white/30'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-[#4F46E5] transition-transform duration-200 ease-in-out ${
                                isToggled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>
            </div>
            <div className="p-4">
                <CourseSections editMode={isToggled} />
            </div>
        </div>
    );
}