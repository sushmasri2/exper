// src/app/dashboard/courses/[tab]/page.tsx
"use client";
import { useParams } from "next/navigation";
import CreateCourse from "../Createcourse";

export default function CourseTabPage() {
  const params = useParams();
  const tab = params.tab as string;
  
  // List of valid tabs
  const validTabs = [
    "courseStructure", 
    "courseSettings", 
    "coursePrice", 
    "seo", 
    "recommendedCourses", 
    "patrons", 
    "logs"
  ];
  
  // If it's not a valid tab, redirect to courseStructure
  if (!validTabs.includes(tab)) {
    return <CreateCourse />;
  }
  
  return <CreateCourse />;
}