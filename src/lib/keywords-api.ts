import { CourseKeyword } from "../types/keyword";
import { fetchWithHeaders } from "./api-client";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';

export async function getCourseKeywords(courseUuid: string): Promise<CourseKeyword[]> {
    try {
        const fullUrl = `${baseUrl}/api/courses/${courseUuid}/keywords`;

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
        if (result.status === "success" && Array.isArray(result.data?.keywords)) {
            return result.data.keywords;
        } else if (Array.isArray(result)) {
            return result;
        } else {
            throw new Error("Unexpected response structure");
        }

    } catch (error) {
        console.error("Error fetching course keywords:", error);
        throw error;
    }
}

export async function updateCourseKeywords(courseUuid: string, keywords: string[]): Promise<CourseKeyword[]> {
    try {
        const fullUrl = `${baseUrl}/api/courses/${courseUuid}/keywords`;
        const response = await fetchWithHeaders(fullUrl, {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ keywords }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error Response:", errorText);
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);

        }

        const result = await response.json();   
        // Handle different possible response structures
        let updatedKeywords: CourseKeyword[] = [];  
        if (result.status === "success" && result.data && Array.isArray(result.data.keywords)) {
            updatedKeywords = result.data.keywords; 
        } else if (result.success !== undefined && !result.success) {
            throw new Error(result.message || "Failed to update keywords");
        }       
        else if (result.data && Array.isArray(result.data)) {
            updatedKeywords = result.data;
        } else if (Array.isArray(result)) {
            updatedKeywords = result;
        }       
        else {
            throw new Error("Unexpected response structure while updating keywords");
        }
        return updatedKeywords;
    }   
    catch (error) {
        console.error("Error updating course keywords:", error);
        if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new Error("Network error: Unable to connect to the API");
        }
        throw error;
    }   
}