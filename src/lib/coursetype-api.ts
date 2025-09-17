// import { CourseType } from '@/types/coursetype';
// import { fetchWithHeaders } from './api-client';

// export async function getCoursesType(): Promise<CourseType[]> {
//   try {
//     const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';
//     if (!baseUrl) {
//       throw new Error('API base URL is not defined');
//     }
//     const response = await fetchWithHeaders(`${baseUrl}/api/course-type`, {
//       method: 'GET'
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
//     }

//     const result = await response.json();

//     if (!result.success) {
//       throw new Error(result.message || 'Unknown API error');
//     }

//     return result.data;
//   } catch (error) {
//     console.error('Error fetching courses:', error);

//     let errorStatus = 500;
//     let errorMessage = 'Failed to fetch courses';

//     if (error instanceof Error) {
//       errorMessage = error.message;
//       if ('status' in error && typeof error.status === 'number') {
//         errorStatus = error.status;
//       } else if (error.message.includes('HTTP error')) {
//         const matches = error.message.match(/HTTP error (\d+)/);
//         if (matches && matches[1]) {
//           errorStatus = parseInt(matches[1], 10);
//         }
//       }
//     }
//     throw new Error(`Courses API Error (${errorStatus}): ${errorMessage}`);
//   }
// }
import { CourseType } from '@/types/coursetype';
import { CourseTypeList } from '@/lib/data/coursetype';

export async function getCoursesType(): Promise<CourseType[]> {
  // Simulate async operation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(CourseTypeList);
    }, 100);
  });
}

// export async function getCourseType(id: number): Promise<CourseType | null> {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       const course = CourseTypeList.find(c => c.id === id);
//       resolve(course || null);
//     }, 100);
//   });
// }