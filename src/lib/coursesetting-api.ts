import { CourseSetting } from "../types/coursesetting";
import { fetchWithHeaders } from "./api-client";

export async function getCourseSettings(courseUuid: string): Promise<CourseSetting | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || "";
        const fullUrl = `${baseUrl}/api/course-settings/course/${courseUuid}/`;

        const response = await fetchWithHeaders(fullUrl, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        // Handle response structure
        if (result.status === "success" && result.data) {
            return result.data;
        } else {
            throw new Error("Unexpected response structure");
        }

    } catch (error) {
        console.error("Error fetching course settings:", error);
        throw error;
    }
}
export async function updateCourseSettings(courseUuid: string, settings: Partial<CourseSetting>): Promise<CourseSetting> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || "";
        const fullUrl = `${baseUrl}/api/course-settings/${courseUuid}/`;
        const response = await fetchWithHeaders(fullUrl, {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(settings),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error Response:', errorText);
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        // Handle response structure
        if (result.status === "success" && result.data) {
            return result.data;
        } else if (result.success !== undefined && !result.success) {
            throw new Error(result.message || 'Unknown API error');
        } else if (result.data) {
            return result.data;
        } else {
            throw new Error('Unexpected response structure');
        }
    } catch (error) {
        console.error('Error updating course settings:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to the API');
        }
        throw error;
    }
}


