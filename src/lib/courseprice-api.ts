// src/lib/course-pricing-api.ts
import { CoursePricing } from '../types/course-pricing';
import { fetchWithHeaders } from './api-client';

export async function getCoursePricing(courseUuid: string): Promise<CoursePricing[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';
    const fullUrl = `${baseUrl}/api/courses/${courseUuid}/pricing`;
    
    const response = await fetchWithHeaders(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Handle response structure
    if (result.data) {
      return result.data;
    } else if (Array.isArray(result)) {
      return result;
    } else {
      throw new Error('Unexpected response structure');
    }

  } catch (error) {
    console.error('Error fetching course pricing:', error);
    throw error;
  }
}