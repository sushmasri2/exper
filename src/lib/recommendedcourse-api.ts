import { RecommendedCourse, RecommendedCourseResponse } from "@/types/recommendedcourses";
import { fetchWithHeaders } from "./api-client";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';

export async function getRecommendedCourse(courseUuid: string): Promise<RecommendedCourse[]> {
    try {
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
        console.log("Fetched recommended courses response:", result);

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
export async function addRecommendedCourse(RecommendedCourse: { course_uuid: string, recommended_course_uuid: string, status: number, must_have: number, position: number }): Promise<RecommendedCourse> {
    try {
        const fullUrl = `${baseUrl}/api/course-recommended/`;
        const response = await fetchWithHeaders(fullUrl, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(RecommendedCourse),
        });
        console.log("Response from adding recommended course:", RecommendedCourse);

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const result: RecommendedCourse = await response.json();

        return result;

    } catch (error) {
        console.error("Error adding recommended course:", error);
        throw error;
    }
}
export async function deleteRecommendedCourse(recommendationId: string): Promise<void> {
    try {
        const fullUrl = `${baseUrl}/api/course-recommended/${recommendationId}/`;
        const response = await fetchWithHeaders(fullUrl, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }
        return;
    } catch (error) {
        console.error("Error deleting recommended course:", error);
        throw error;
    }
}
export async function updateRecommendedCourse(RecommendedCourse: { course_uuid: string, recommended_course_uuid: string, status: number, must_have: number, position: number }, recommendationId: string): Promise<RecommendedCourse> {
    try {
        const fullUrl = `${baseUrl}/api/course-recommended/${recommendationId}/`;
        const response = await fetchWithHeaders(fullUrl, {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(RecommendedCourse),
        });
        console.log("Response from updating recommended course:", response);

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const result: RecommendedCourse = await response.json();

        return result;
    } catch (error) {
        console.error("Error updating recommended course:", error);
        throw error;
    }
}
