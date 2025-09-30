import {RecommendedCourse, RecommendedCourseResponse} from "@/types/recommendedcourses";
import { fetchWithHeaders } from "./api-client";

export async function getRecommendedCourse(courseUuid: string): Promise<RecommendedCourse[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || "";
        const fullUrl = `${baseUrl}/api/course-recommended/course/${courseUuid}/`;

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

        const result: RecommendedCourseResponse = await response.json();

        // Handle response structure
        if (result.status === "success" && result.data && result.data.recommendations) {
            return result.data.recommendations;
        } else {
            return [];
        }

    } catch (error) {
        console.error("Error fetching recommended courses:", error);
        throw error;
    }
}


