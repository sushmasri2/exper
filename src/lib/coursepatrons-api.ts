import { CoursePatronsResponse,PatronApiResponse,CreatePatronData,UpdatePatronData} from "@/types/coursepatrons";
import { fetchWithHeaders } from "./api-client";


const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';

export async function getCoursesPatrons(courseUuid: string): Promise<CoursePatronsResponse | null> {
     try {
        const fullUrl = `${baseUrl}/api/course-patrons/${courseUuid}/`;

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

        const result = await response.json() as CoursePatronsResponse;

        // Handle response structure
        if (result.status === "success" && result.data) {
            return result;
        } else {
            throw new Error("Unexpected response structure");
        }

    } catch (error) {
        console.error("Error fetching course patrons:", error);
        throw error;
    }
}

export async function createPatron(courseUuid: string, patronData: CreatePatronData): Promise<PatronApiResponse> {
    try {
        const fullUrl = `${baseUrl}/api/course-patrons/${courseUuid}/`;

        const response = await fetchWithHeaders(fullUrl, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(patronData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json() as PatronApiResponse;
        return result;

    } catch (error) {
        console.error("Error creating patron:", error);
        throw error;
    }
}

export async function updatePatron(courseUuid: string, patronData: UpdatePatronData): Promise<PatronApiResponse> {
    try {
        const fullUrl = `${baseUrl}/api/course-patrons/${courseUuid}/${patronData.id}/`;

        const response = await fetchWithHeaders(fullUrl, {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: patronData.name,
                designation: patronData.designation,
                image: patronData.image,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json() as PatronApiResponse;
        return result;

    } catch (error) {
        console.error("Error updating patron:", error);
        throw error;
    }
}

export async function deletePatron(courseUuid: string, patronId: number): Promise<PatronApiResponse> {
    try {
        const fullUrl = `${baseUrl}/api/course-patrons/${courseUuid}/${patronId}/`;

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

        const result = await response.json() as PatronApiResponse;
        return result;

    } catch (error) {
        console.error("Error deleting patron:", error);
        throw error;
    }
}

