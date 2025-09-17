import { CourseCategory } from '@/types/coursecategory';
// import { CourseCategoryList } from '@/lib/data/category';
import { fetchWithHeaders } from './api-client';

export async function getCoursesCategory(): Promise<CourseCategory[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';
    console.log('Base URL:', baseUrl); // Debug log
    console.log('Full URL:', `${baseUrl}/api/categories`); // Debug log
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }
    const response = await fetchWithHeaders(`${baseUrl}/api/categories`, {
      method: 'GET'
    });
    console.log('Response Status:', response); // Debug log

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Unknown API error');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching courses:', error);

    let errorStatus = 500;
    let errorMessage = 'Failed to fetch courses';

    if (error instanceof Error) {
      errorMessage = error.message;
      if ('status' in error && typeof error.status === 'number') {
        errorStatus = error.status;
      } else if (error.message.includes('HTTP error')) {
        const matches = error.message.match(/HTTP error (\d+)/);
        if (matches && matches[1]) {
          errorStatus = parseInt(matches[1], 10);
        }
      }
    }
    throw new Error(`Courses API Error (${errorStatus}): ${errorMessage}`);
  }
}


// export async function getCoursesCategory(): Promise<CourseCategory[]> {
//   // Simulate async operation
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(CourseCategoryList);
//     }, 100);
//   });
// }

// export async function getCourseCategory(id: number): Promise<CourseCategory | null> {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       const course = CourseCategoryList.find(c => c.id === id);
//       resolve(course || null);
//     }, 100);
//   });
// }