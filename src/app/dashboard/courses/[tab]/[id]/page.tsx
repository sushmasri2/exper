"use client";
import { useParams } from "next/navigation";
import CreateCourse from "../../createcourse";

export default function CourseTabWithIdPage() {
  const params = useParams();
  const tab = params.tab as string;
  const id = params.id as string;
  
  // This handles routes like /dashboard/courses/coursestructure/123
  return <CreateCourse />;
}