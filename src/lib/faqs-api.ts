import { fetchWithHeaders } from './api-client';
import { CourseFAQsResponse } from '@/types/faqs';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';

/**
 * Fetch FAQs for a specific course
 */
export async function getCourseFAQs(courseUuid: string): Promise<CourseFAQsResponse> {
    try {
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

/**
 * Update FAQ for a course
 */
export async function updateFAQCourse(
    faqUuid: string,
    question: string,
    answers: string,
    status: number,
    position: number
): Promise<CourseFAQsResponse> {
    try {
        if (!baseUrl) {
            throw new Error('API base URL is not defined');
        }

        const fullUrl = `${baseUrl}/api/course-faqs/${faqUuid}`;
        const response = await fetchWithHeaders(fullUrl, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                faq_uuid: faqUuid,
                question,
                answers,
                status,
                position
            }),
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
        console.error('Error updating FAQ course assignment:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to the API');
        }
        throw error;
    }
}

/**
 * Delete FAQ
 */
export async function deleteFAQ(faqUuid: string): Promise<void> {
    try {
        if (!baseUrl) {
            throw new Error('API base URL is not defined');
        }

        const fullUrl = `${baseUrl}/api/course-faqs/${faqUuid}`;
        const response = await fetchWithHeaders(fullUrl, {
            method: 'DELETE',
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
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to the API');
        }
        throw error;
    }
}

/**
 * Create new FAQ
 */
export async function createFAQ(
    faqData: {
        course_id: string;
        question: string;
        answers: string;
        position: number;
        status: number;
    }
): Promise<CourseFAQsResponse> {
    try {
        if (!baseUrl) {
            throw new Error('API base URL is not defined');
        }

        const fullUrl = `${baseUrl}/api/course-faqs`;
        const response = await fetchWithHeaders(fullUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(faqData),
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
        console.error('Error creating FAQ:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to the API');
        }
        throw error;
    }
}