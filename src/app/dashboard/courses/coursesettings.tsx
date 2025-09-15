"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Course } from "@/types/course";

export default function CourseSettings() {
    const searchParams = useSearchParams();
    const courseId = searchParams.get('id');
    const [courseData, setCourseData] = useState<Course | null>(null);

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

    return <div><h1>{courseData?.course_name || "New Course"}</h1></div>;
};

