"use client";
import { useParams } from "next/navigation";
import CreateCourse from "../../Createcourse";

export default function CourseWithSlugPage() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  
  return <CreateCourse courseSlug={courseSlug} />;
}