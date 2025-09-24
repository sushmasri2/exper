import { fetchWithHeaders } from './api-client';
import { Specialty, IntendedAudienceResponse } from '@/types/specialities';

/**
 * Fetch all specialities/intended audience options
 */
export async function getSpecialities(): Promise<Specialty[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';
        if (!baseUrl) {
            throw new Error('API base URL is not defined');
        }
        const page = 1;
        const pageSize = 100;

        const fullUrl = `${baseUrl}/api/specialities?page=${page}&limit=${pageSize}`;
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

        return result.data || result || [];
    } catch (error) {
        console.error('Error fetching specialities:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to the API');
        }
        throw error;
    }
}

/**
 * Fetch intended audiences for a specific course
 */
export async function getCourseIntendedAudiences(courseUuid: string): Promise<IntendedAudienceResponse> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';
        if (!baseUrl) {
            throw new Error('API base URL is not defined');
        }

        const fullUrl = `${baseUrl}/api/intended-audiences/course/${courseUuid}`;
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
        console.error('Error fetching course intended audiences:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to the API');
        }
        throw error;
    }
}
