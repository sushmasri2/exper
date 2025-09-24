import { fetchWithHeaders } from './api-client';
import {CourseFAQsResponse} from '@/types/faqs';


/**
 * Fetch FAQs for a specific course
 */
export async function getCourseFAQs(courseUuid: string): Promise<CourseFAQsResponse> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';
        if (!baseUrl) {
            throw new Error('API base URL is not defined');
        }

        const fullUrl = `${baseUrl}/api/course-faqs/course/${courseUuid}`;
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

        return result;
    } catch (error) {
        console.error('Error fetching course FAQs:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to the API');
        }
        throw error;
    }
}
