import { Course } from '@/types/course';
import { fetchWithHeaders } from './api-client';

export async function getCourses(): Promise<Course[]> {
  try {
    // const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    // if (!baseUrl) {
    //   throw new Error('API base URL is not defined');
    // }
    // const response = await fetchWithHeaders(`${baseUrl}/api/courses`, {
    //   method: 'GET'
    // });
    const response = await fetchWithHeaders('/api/courses', {
      method: 'GET'
    });

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