"use client";

import { Course } from "@/types/course";
import { RecommendedCourse } from "@/types/recommendedcourses";
import { getRecommendedCourse } from "@/lib/recommendedcourse-api";
import { getCourses } from "@/lib/courses-api";
import { useEffect, useState } from "react";
import Table from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select2, { Select2Option } from "@/components/ui/Select2";
import { Trash2 } from "lucide-react";

interface CourseRecommendedProps {
    courseData?: Course | null;
}
export default function RecommendedCourses({ courseData }: CourseRecommendedProps) {
    const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourse[]>([]);
    const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch available courses for the dropdown
                const courses = await getCourses();
                setAvailableCourses(courses);
                console.log(courses);
                // Fetch recommended courses if courseData is available
                if (courseData && courseData.uuid) {
                    const recommendedCourses = await getRecommendedCourse(courseData.uuid);
                    setRecommendedCourses(recommendedCourses);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
            finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [courseData]);

    const handleCourseChange = (courseId: string, recommendationId: number) => {
        // Find the selected course
        const selectedCourse = availableCourses.find(course => course.uuid === courseId);
        if (!selectedCourse) return;

        // Update the recommended courses list
        setRecommendedCourses(prev =>
            prev.map(rec =>
                rec.id === recommendationId
                    ? {
                        ...rec,
                        recomended_course_id: selectedCourse.id,
                        recommendedCourse: {
                            id: selectedCourse.id,
                            uuid: selectedCourse.uuid,
                            course_name: selectedCourse.course_name,
                            short_description: selectedCourse.short_description,
                            status: selectedCourse.status
                        }
                    }
                    : rec
            )
        );
    };
        if (loading) return <div>Loading...</div>;

    return <div>
        {recommendedCourses.length > 0 ? (
            <Table
                columns={[
                    {
                        header: "S.No",
                        accessor: "index",
                        render: (value: unknown, row: RecommendedCourse, index: number) => (
                            <>{index + 1}</>
                        ),
                    },
                    {
                        header: "Course Name",
                        accessor: "course_name",
                        render: (value: unknown, row: RecommendedCourse) => {
                            const courseOptions: Select2Option[] = availableCourses.map(course => ({
                                label: course.course_name,
                                value: course.uuid
                            }));

                            return (
                                <Select2
                                    options={courseOptions}
                                    value={row.recommendedCourse.uuid}
                                    onChange={(selectedValue) => handleCourseChange(selectedValue as string, row.id)}
                                    placeholder="Select a course..."
                                    className="min-w-[200px]"
                                />
                            );
                        },
                    },
                    {
                        header: "Position",
                        accessor: "position",
                        render: (value: unknown, row: RecommendedCourse) => (
                            <Input
                                type="number"
                                value={value as number}
                                className="w-16"
                                onChange={(e) => {
                                    const newPosition = parseInt(e.target.value);
                                    setRecommendedCourses(prev =>
                                        prev.map(rec =>
                                            rec.id === row.id
                                                ? { ...rec, position: newPosition }
                                                : rec
                                        )
                                    );
                                }}
                            />
                        ),
                    },
                    {
                        header: "Must Have",
                        accessor: "must_have",
                        render: (value: unknown, row: RecommendedCourse) => (
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={Boolean(value)}
                                    onChange={(e) => {
                                        setRecommendedCourses(prev =>
                                            prev.map(rec =>
                                                rec.id === row.id
                                                    ? { ...rec, must_have: e.target.checked ? 1 : 0 }
                                                    : rec
                                            )
                                        );
                                    }}
                                    className="sr-only"
                                />
                                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${Boolean(value) ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${Boolean(value) ? 'translate-x-6' : 'translate-x-1'
                                        }`} />
                                </div>
                            </label>
                        ),
                    },
                    {
                        header: "Status",
                        accessor: "status",
                        render: (value: unknown) => ((value as boolean) ? "Active" : "Inactive"),
                    },
                    {
                        header: "Actions",
                        accessor: "actions",
                        render: () => (
                            <Button><Trash2 color="red" /></Button>
                        )
                    }
                ]}
                data={recommendedCourses.map((recommendation) => ({
                    ...recommendation,
                    course_name: recommendation.recommendedCourse.course_name,
                }))}
            />
        ) : (
            <p>No recommended courses available.</p>
        )}
    </div>;
}