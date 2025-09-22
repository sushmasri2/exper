import { Eligibility } from '@/types/eligibility';
import { fetchWithHeaders } from './api-client';

// Interface for the course eligibility API response
interface CourseEligibilityResponse {
  status: string;
  data: {
    course_uuid: string;
    eligibilities: {
      id: number;
      eligibility_uuid: string;
      eligibility_name: string;
      eligibility_status: number;
      created_at: string;
      updated_at: string;
    }[];
  };
}

export async function getEligibilities(): Promise<Eligibility[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }

    let allEligibilities: Eligibility[] = [];
    let page = 1;
    let hasMore = true;
    const pageSize = 100; // Adjust as needed for your API

    while (hasMore) {
      const fullUrl = `${baseUrl}/api/eligibility?page=${page}&limit=${pageSize}`;
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

      let eligibilities: Eligibility[] = [];
      if (result.data) {
        eligibilities = result.data;
      } else if (Array.isArray(result)) {
        eligibilities = result;
      } else {
        throw new Error('Unexpected response structure');
      }

      allEligibilities = allEligibilities.concat(eligibilities);

      // If less than pageSize returned, assume last page
      if (eligibilities.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return allEligibilities;
  } catch (error) {
    console.error('Error fetching eligibilities:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the API');
    }
    throw error;
  }
}

export async function getCourseEligibilities(courseUuid: string): Promise<Eligibility[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }

    const fullUrl = `${baseUrl}/api/courses/${courseUuid}/eligibility`;
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

    const result: CourseEligibilityResponse = await response.json();

    if (result.status !== 'success') {
      throw new Error('API returned error status');
    }

    let eligibilities: Eligibility[] = [];
    
    // Handle the specific API response structure
    if (result.data && result.data.eligibilities && Array.isArray(result.data.eligibilities)) {
      // Map the response structure to match our Eligibility type
      eligibilities = result.data.eligibilities.map((item) => ({
        id: item.id.toString(),
        uuid: item.eligibility_uuid,
        name: item.eligibility_name,
        description: item.eligibility_name, // Using name as description since it's not provided
        course_id: result.data.course_uuid,
        eligibility_criteria: '', // Not provided in response
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } else {
      console.warn('Unexpected course eligibilities response structure:', result);
      eligibilities = [];
    }

    return eligibilities;
  } catch (error) {
    console.error('Error fetching course eligibilities:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the API');
    }
    throw error;
  }
}