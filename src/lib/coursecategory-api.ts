import { CourseCategory } from '@/types/coursecategory';
import { fetchWithHeaders } from './api-client';

export async function getCoursesCategory(): Promise<CourseCategory[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';
    
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }

    const fullUrl = `${baseUrl}/api/categories`;

    // Try without interceptor first - use plain fetch
    const response = await fetchWithHeaders(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Remove Platform header if not needed by course API
      },
      // Remove credentials if not needed
    });


    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error Response:', errorText);
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // Check if response has the expected structure
    if (result.success !== undefined && !result.success) {
      throw new Error(result.message || 'Unknown API error');
    }

    // Handle different response structures
    if (result.data) {
      return result.data;
    } else if (Array.isArray(result)) {
      return result;
    } else {
      throw new Error('Unexpected response structure');
    }

  } catch (error) {
    console.error('Error fetching categories:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the API');
    }

    throw error;
  }
}