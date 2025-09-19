import { CourseCategory } from '@/types/coursecategory';
import { fetchWithHeaders } from './api-client';

export async function getCoursesCategory(): Promise<CourseCategory[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }

    let allCategories: CourseCategory[] = [];
    let page = 1;
    let hasMore = true;
    const pageSize = 100; // Adjust as needed for your API

    while (hasMore) {
      const fullUrl = `${baseUrl}/api/categories?page=${page}&limit=${pageSize}`;
      const response = await fetchWithHeaders(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error Response:', errorText);
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success !== undefined && !result.success) {
        throw new Error(result.message || 'Unknown API error');
      }

      let categories: CourseCategory[] = [];
      if (result.data) {
        categories = result.data;
      } else if (Array.isArray(result)) {
        categories = result;
      } else {
        throw new Error('Unexpected response structure');
      }

      allCategories = allCategories.concat(categories);

      // If less than pageSize returned, assume last page
      if (categories.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return allCategories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the API');
    }
    throw error;
  }
}