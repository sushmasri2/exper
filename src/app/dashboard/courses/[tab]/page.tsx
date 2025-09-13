"use client";
import { useParams } from "next/navigation";
import CreateCourse from "../Createcourse";

export default function CourseTabPage() {
  const params = useParams();
  const tab = params.tab as string;
  
  // This handles routes like /dashboard/courses/courseStructure (no courseSlug)
  return <CreateCourse />;
}