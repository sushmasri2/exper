"use client";
import { useParams } from "next/navigation";
import CreateCourse from "../createcourse";
import { useSearchParams } from "next/navigation";

export default function CourseTabPage() {
  const params = useParams();
  const tab = params.tab as string;
  const searchParams = useSearchParams();
const courseId = searchParams.get('id');
  
  // This handles routes like /dashboard/courses/courseStructure (no courseSlug)
  return <CreateCourse />;
}