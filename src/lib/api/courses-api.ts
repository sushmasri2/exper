import { Course } from '@/types/course';

export async function fetchCourses(): Promise<Course[]> {
  try {
    const response = await fetch('/api/courses');
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
}