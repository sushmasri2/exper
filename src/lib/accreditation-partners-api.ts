import { AccreditationPartner,CourseAccreditationPartnerItem } from '@/types/accreditation-partners';
import { fetchWithHeaders } from './api-client';

 const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || ''; 

export async function getAccreditationPartners(): Promise<AccreditationPartner[]> {
  try {
   
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }

    let allPartners: AccreditationPartner[] = [];
    let page = 1;
    let hasMore = true;
    const pageSize = 100; // Adjust as needed for your API

    while (hasMore) {
      const fullUrl = `${baseUrl}/api/accreditation-partners?page=${page}&limit=${pageSize}`;
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

      let partners: AccreditationPartner[] = [];
      if (result.data) {
        partners = result.data;
      } else if (Array.isArray(result)) {
        partners = result;
      } else {
        throw new Error('Unexpected response structure');
      }

      allPartners = allPartners.concat(partners);

      // If less than pageSize returned, assume last page
      if (partners.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return allPartners;
  } catch (error) {
    console.error('Error fetching accreditation partners:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the API');
    }
    throw error;
  }
}
export async function getCourseAccreditationPartners(courseUuid: string): Promise<AccreditationPartner[]> {
  try {
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }

    const fullUrl = `${baseUrl}/api/courses/${courseUuid}/accreditation-partners`;
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

    // Handle the actual API response structure
    if (result.status === "success" && result.data && Array.isArray(result.data)) {
      const partners: AccreditationPartner[] = result.data
        .filter((item: CourseAccreditationPartnerItem) => item.AccreditationPartner)
        .map((item: CourseAccreditationPartnerItem) => ({
          id: item.AccreditationPartner.id.toString(),
          uuid: item.AccreditationPartner.uuid,
          name: item.AccreditationPartner.name,
          image_url: item.AccreditationPartner.image_url,
          position: item.AccreditationPartner.position,
          created_at: item.created_at,
          updated_at: item.updated_at
        }));
      
      return partners;
    } else {
      console.warn('Unexpected course accreditation partners response structure:', result);
      return [];
    }

  } catch (error) {
    console.error('Error fetching course accreditation partners:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the API');
    }
    throw error;
  }
}