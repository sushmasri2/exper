import { CourseKeyword } from "../types/keyword";
import { fetchWithHeaders } from "./api-client";

export async function getCourseKeywords(courseUuid: string): Promise<CourseKeyword[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || "";
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
