import { Eligibility } from '@/types/eligibility';
import { fetchWithHeaders } from './api-client';


export async function getEligibility(): Promise<Eligibility | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';
    
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }

    const fullUrl = `${baseUrl}/api/eligibility`;

    // Try without interceptor first - use plain fetch
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

    // Check if response has the expected structure
    if (result.success !== undefined && !result.success) {
      throw new Error(result.message || 'Unknown API error');
    }

    // Handle different response structures
    if (result.data) {
      return result.data;
    } else if (Array.isArray(result)) {
      // If result is an array, return the first element or null if empty
      return result.length > 0 ? result[0] : null;
    } else {
      throw new Error('Unexpected response structure');
    }

  } catch (error) {
    console.error('Error fetching Eligibility:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the API');
    }

    throw error;
  }
}

export async function getAllEligibilities(): Promise<Eligibility[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';
    
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }

    const fullUrl = `${baseUrl}/api/eligibility`;

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

    // Check if response has the expected structure
    if (result.success !== undefined && !result.success) {
      throw new Error(result.message || 'Unknown API error');
    }

    // Handle different response structures
    if (result.data) {
      return Array.isArray(result.data) ? result.data : [result.data];
    } else if (Array.isArray(result)) {
      return result;
    } else {
      throw new Error('Unexpected response structure');
    }

  } catch (error) {
    console.error('Error fetching all Eligibilities:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the API');
    }

    throw error;
  }
}