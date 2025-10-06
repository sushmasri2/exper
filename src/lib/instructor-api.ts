import { Instructor, CourseInstructorLink } from '@/types/instructor';
import { fetchWithHeaders } from './api-client';

/**
 * Fetch all available course instructors
 * @returns Promise<Instructor[]> Array of instructors
 */
export async function getCourseInstructors(): Promise<Instructor[]> {
    try {
        const fullUrl = `${baseUrl}/api/course-instructors`;

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
        // if (result.data && typeof result.data === 'object') {
        //     console.log('Keys in result.data:', Object.keys(result.data));
        // }

        // Handle different possible response structures
        let instructors: Instructor[] = [];

        if (result.status === "success" && result.data) {
            // Check if data is an array directly
            if (Array.isArray(result.data)) {
                instructors = result.data;
            }
            // Check if data is an object with nested array properties
            else if (typeof result.data === 'object') {
                // Try common array property names
                if (Array.isArray(result.data.instructors)) {
                    instructors = result.data.instructors;
                } else if (Array.isArray(result.data.data)) {
                    instructors = result.data.data;
                } else if (Array.isArray(result.data.results)) {
                    instructors = result.data.results;
                } else if (Array.isArray(result.data.items)) {
                    instructors = result.data.items;
                } else {
                    // Try to find any array property in the data object
                    const dataKeys = Object.keys(result.data);
                    for (const key of dataKeys) {
                        if (Array.isArray(result.data[key])) {
                            console.log(`Found array in result.data.${key}`);
                            instructors = result.data[key];
                            break;
                        }
                    }
                }
            }
        } else if (result.success !== undefined && !result.success) {
            console.warn('API returned success: false, checking for data anyway');
            // Sometimes APIs return success: false but still have data
            if (result.data && Array.isArray(result.data)) {
                instructors = result.data;
            } else if (Array.isArray(result)) {
                instructors = result;
            } else {
                throw new Error(result.message || 'Failed to fetch instructors');
            }
        } else if (result.data && Array.isArray(result.data)) {
            instructors = result.data;
        } else if (Array.isArray(result)) {
            instructors = result;
        } else if (result.instructors && Array.isArray(result.instructors)) {
            instructors = result.instructors;
        } else if (result.results && Array.isArray(result.results)) {
            instructors = result.results;
        } else {
            console.warn('Could not find instructor array in response, returning empty array');
            console.log('Full response structure:', result);
            instructors = [];
        }

        return instructors;
    } catch (error) {
        console.error('Error fetching course instructors:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to the instructors API');
        }
        throw error;
    }
}

/**
 * Fetch instructors linked to a specific course
 * @param courseUuid The UUID of the course
 * @returns Promise<CourseInstructorLink[]> Array of instructor links for the course
 */
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';

export async function getCourseInstructorLinks(courseUuid: string): Promise<CourseInstructorLink[]> {
    try {
        const fullUrl = `${baseUrl}/api/instructors-linking/course/${courseUuid}`;

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

        // Handle different possible response structures
        let instructorLinks: CourseInstructorLink[] = [];

        if (result.status === "success" && result.data && Array.isArray(result.data)) {
            // Handle the actual API response structure
            instructorLinks = result.data;
        } else if (result.success !== undefined && !result.success) {
            console.warn('Instructor links API returned success: false, checking for data anyway');
            // Sometimes APIs return success: false but still have data
            if (result.data && Array.isArray(result.data)) {
                instructorLinks = result.data;
            } else if (Array.isArray(result)) {
                instructorLinks = result;
            } else {
                console.warn('No instructor links found for course');
                instructorLinks = [];
            }
        } else if (result.data && Array.isArray(result.data)) {
            instructorLinks = result.data;
        } else if (Array.isArray(result)) {
            instructorLinks = result;
        } else if (result.instructors && Array.isArray(result.instructors)) {
            instructorLinks = result.instructors;
        } else if (result.results && Array.isArray(result.results)) {
            instructorLinks = result.results;
        } else {
            console.warn('No instructor links found, might be empty for this course');
            instructorLinks = [];
        }

        return instructorLinks;
    } catch (error) {
        console.error('Error fetching course instructor links:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to the instructor links API');
        }
        throw error;
    }
}

export async function UpdatecourseInstructors(courseUuid: string, instructors: string[]): Promise<CourseInstructorLink[]> {
    try {
        const fullUrl = `${baseUrl}/api/instructors-linking/course/${courseUuid}/`;
        const response = await fetchWithHeaders(fullUrl, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ instructors }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error Response:', errorText);
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        // Handle different possible response structures
        let updatedLinks: CourseInstructorLink[] = [];
        if (result.status === "success" && result.data && Array.isArray(result.data)) {
            updatedLinks = result.data;
        }
        else if (result.success !== undefined && !result.success) {
            throw new Error(result.message || 'Failed to update instructor links');
        } else if (result.data && Array.isArray(result.data)) {
            updatedLinks = result.data;
        }
        else if (Array.isArray(result)) {
            updatedLinks = result;
        }
        else {
            throw new Error('Unexpected response structure while updating instructor links');
        }
        return updatedLinks;
    } catch (error) {
        console.error('Error updating course instructors:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to the API');
        }
        throw error;
    }
}
