import { fetchWithHeaders } from './api-client';
import { withCacheInvalidation } from './cache-utils';
import { showToast } from './toast';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';

/**
 * Interface for course deletion result
 */
export interface CourseDeletionResult {
    success: boolean;
    message: string;
    deletedItems?: {
        course?: boolean;
        intendedAudiences?: boolean;
        recommendedCourses?: boolean;
        faqs?: boolean;
        keywords?: boolean;
        courseSettings?: boolean;
        instructors?: boolean;
        eligibilities?: boolean;
        patrons?: boolean;
        pricing?: boolean;
    };
    errors?: string[];
}
/**
 * Delete the main course record
 */
async function _deleteCourse(courseUuid: string): Promise<void> {
    try {
        if (!baseUrl) {
            throw new Error('API base URL is not defined');
        }

        const fullUrl = `${baseUrl}/api/courses/${courseUuid}`;

        const response = await fetchWithHeaders(fullUrl, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error deleting course:', errorText);

            // Try to parse the error response for detailed information
            try {
                const errorData = JSON.parse(errorText);
                if (errorData.error || errorData.message) {
                    const errorMessage = errorData.error || errorData.message || `HTTP error ${response.status}: ${response.statusText}`;
                    throw new Error(errorMessage);
                }
            } catch {
                // If parsing fails, fall back to generic HTTP error
            }

            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success !== undefined && !result.success) {
            throw new Error(result.message || 'Failed to delete course');
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        throw error;
    }
}

/**
 * Delete intended audiences for a course
 */
async function _deleteIntendedAudiences(courseUuid: string): Promise<void> {
    try {
        if (!baseUrl) {
            throw new Error('API base URL is not defined');
        }

        const fullUrl = `${baseUrl}/api/intended-audiences/course/${courseUuid}`;

        const response = await fetchWithHeaders(fullUrl, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error deleting intended audiences:', errorText);
            throw new Error(`Failed to delete intended audiences: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success !== undefined && !result.success) {
            throw new Error(result.message || 'Failed to delete intended audiences');
        }
    } catch (error) {
        console.error('Error deleting intended audiences:', error);
        throw error;
    }
}
/**
 * Delete recommended courses for a course
 */
async function _deleteRecommendedCourses(courseUuid: string): Promise<void> {
    try {
        if (!baseUrl) {
            throw new Error('API base URL is not defined');
        }

        const fullUrl = `${baseUrl}/api/course-recommended/course/${courseUuid}`;

        const response = await fetchWithHeaders(fullUrl, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error deleting recommended courses:', errorText);
            throw new Error(`Failed to delete recommended courses: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success !== undefined && !result.success) {
            throw new Error(result.message || 'Failed to delete recommended courses');
        }
    } catch (error) {
        console.error('Error deleting recommended courses:', error);
        throw error;
    }
}

/**
 * Delete keywords for a course
 */
async function _deleteKeywords(courseUuid: string): Promise<void> {
    try {
        if (!baseUrl) {
            throw new Error('API base URL is not defined');
        }

        const fullUrl = `${baseUrl}/api/keywords/course/${courseUuid}`;

        const response = await fetchWithHeaders(fullUrl, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error deleting keywords:', errorText);
            throw new Error(`Failed to delete keywords: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success !== undefined && !result.success) {
            throw new Error(result.message || 'Failed to delete keywords');
        }
    } catch (error) {
        console.error('Error deleting keywords:', error);
        throw error;
    }
}
/**
 * Delete  course settings record
 */
async function _deleteCourseSettings(courseUuid: string): Promise<void> {
    try {
        const fullUrl = `${baseUrl}/api/course-settings/${courseUuid}/`;
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
    } catch (error) {
        console.error("Error deleting course settings:", error);
        throw error;
    }
}
/**
 * Delete  course pricing record
 */
async function _deleteCoursePricing(courseUuid: string): Promise<void> {
    try {
        if (!baseUrl) {
            throw new Error('API base URL is not defined');
        }
        const fullUrl = `${baseUrl}/api/courses/${courseUuid}/pricing`;
        const response = await fetchWithHeaders(fullUrl, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error deleting course pricing:', errorText);
            throw new Error(`Failed to delete course pricing: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success !== undefined && !result.success) {
            throw new Error(result.message || 'Failed to delete course pricing');
        }
    } catch (error) {
        console.error('Error deleting course pricing:', error);
        throw error;
    }
}
/**
 * Delete course instructors record
 */
async function _deleteCourseInstructors(courseUuid: string): Promise<void> {
    try {
        if (!baseUrl) {
            throw new Error('API base URL is not defined');
        }
        const fullUrl = `${baseUrl}/api/instructors-linking/course/${courseUuid}/`;
        const response = await fetchWithHeaders(fullUrl, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error deleting course instructors:', errorText);
            throw new Error(`Failed to delete course instructors: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        if (result.success !== undefined && !result.success) {
            throw new Error(result.message || 'Failed to delete instructor links');
        }
    }
    catch (error) {
        console.error('Error deleting course instructors:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to the API');
        }
        throw error;
    }
}
/**
 * Delete course eligibility record
 */
async function _deleteCourseEligibilities(courseUuid: string): Promise<void> {
    try {
        if (!baseUrl) {
            throw new Error('API base URL is not defined');
        }
        const fullUrl = `${baseUrl}/api/courses/${courseUuid}/eligibility`;
        const response = await fetchWithHeaders(fullUrl, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error deleting course eligibilities:', errorText);
            throw new Error(`Failed to delete course eligibilities: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success !== undefined && !result.success) {
            throw new Error(result.message || 'Failed to delete course eligibilities');
        }
    } catch (error) {
        console.error('Error deleting course eligibilities:', error);
        throw error;
    }
}
/**
 * Delete course patron record
 */
async function _deletePatron(courseUuid: string): Promise<void> {
    try {
        if (!baseUrl) {
            throw new Error('API base URL is not defined');
        }
        const fullUrl = `${baseUrl}/api/course-patrons/${courseUuid}/`;

        const response = await fetchWithHeaders(fullUrl, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error deleting patron:', errorText);
            throw new Error(`Failed to delete patron: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success !== undefined && !result.success) {
            throw new Error(result.message || 'Failed to delete patron');
        }
    } catch (error) {
        console.error("Error deleting patron:", error);
        throw error;
    }
}


/**
 * Comprehensive course deletion - deletes course and all related data
 * This function orchestrates the deletion of a course and all its associated data
 * 
 * @param courseUuid - The UUID of the course to delete
 * @param options - Optional configuration for what to delete
 * @returns Promise<CourseDeletionResult> - Result of the deletion operation
 */
async function _deleteCompletelyCoursely(
    courseUuid: string,
    options: {
        deleteIntendedAudiences?: boolean;
        deleteRecommendedCourses?: boolean;
        deleteKeywords?: boolean;
        deleteCourseSettings?: boolean;
        deleteInstructors?: boolean;
        deleteEligibilities?: boolean;
        deletePatrons?: boolean;
        deletePricing?: boolean;
    } = {}
): Promise<CourseDeletionResult> {
    const {
        deleteIntendedAudiences = true,
        deleteRecommendedCourses = true,
        deleteKeywords = true,
        deleteCourseSettings = true,
        deleteInstructors = true,
        deleteEligibilities = true,
        deletePatrons = true,
        deletePricing = true,
    } = options;

    const result: CourseDeletionResult = {
        success: false,
        message: '',
        deletedItems: {},
        errors: []
    };

    try {
        // Step 1: Delete related entities first (in parallel for better performance)
        const deletionPromises: Promise<void>[] = [];
        const deletionTypes: string[] = [];

        if (deleteIntendedAudiences) {
            deletionPromises.push(_deleteIntendedAudiences(courseUuid));
            deletionTypes.push('intendedAudiences');
        }

        if (deleteRecommendedCourses) {
            deletionPromises.push(_deleteRecommendedCourses(courseUuid));
            deletionTypes.push('recommendedCourses');
        }

        if (deleteKeywords) {
            deletionPromises.push(_deleteKeywords(courseUuid));
            deletionTypes.push('keywords');
        }
        if (deleteCourseSettings) {
            deletionPromises.push(_deleteCourseSettings(courseUuid));
            deletionTypes.push('courseSettings');
        }
        if (deleteInstructors) {
            deletionPromises.push(_deleteCourseInstructors(courseUuid));
            deletionTypes.push('instructors');
        }
        if (deleteEligibilities) {
            deletionPromises.push(_deleteCourseEligibilities(courseUuid));
            deletionTypes.push('eligibilities');
        }
        if (deletePatrons) {

            deletionPromises.push(_deletePatron(courseUuid));
            deletionTypes.push('patrons');
        }
        if (deletePricing) {
            deletionPromises.push(_deleteCoursePricing(courseUuid));
            deletionTypes.push('pricing');
        }

        // Execute all deletion operations in parallel
        const deletionResults = await Promise.allSettled(deletionPromises);

        // Track which deletions succeeded/failed
        deletionResults.forEach((deleteResult, index) => {
            const deletionType = deletionTypes[index] as keyof NonNullable<CourseDeletionResult['deletedItems']>;

            if (deleteResult.status === 'fulfilled') {
                result.deletedItems![deletionType] = true;
            } else {
                result.deletedItems![deletionType] = false;
                result.errors!.push(`Failed to delete ${deletionType}: ${deleteResult.reason.message}`);
            }
        });

        // Step 2: Delete the main course record
        try {
            await _deleteCourse(courseUuid);
            result.deletedItems!.course = true;
        } catch (error) {
            result.deletedItems!.course = false;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            result.errors!.push(`Failed to delete course: ${errorMessage}`);
        }

        // Determine overall success
        const hasErrors = result.errors!.length > 0;
        const courseDeleted = result.deletedItems!.course === true;

        if (courseDeleted && !hasErrors) {
            result.success = true;
            result.message = 'Course and all related data deleted successfully';
            showToast('Course deleted successfully', 'success');
        } else if (courseDeleted && hasErrors) {
            result.success = true; // Course was deleted, but some related data failed
            result.message = 'Course deleted, but some related data could not be removed';
            showToast('Course deleted with some warnings', 'warning');
        } else {
            result.success = false;
            result.message = 'Failed to delete course';
            showToast('Failed to delete course', 'error');
        }

        return result;

    } catch (error) {
        console.error('Error in complete course deletion:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        result.success = false;
        result.message = `Course deletion failed: ${errorMessage}`;
        result.errors!.push(errorMessage);

        showToast(`Failed to delete course: ${errorMessage}`, 'error');

        return result;
    }
}

/**
 * Delete only specific related entities for a course (without deleting the course itself)
 */
async function _deleteRelatedCourseData(
    courseUuid: string,
    entities: {
        intendedAudiences?: boolean;
        recommendedCourses?: boolean;
        faqs?: boolean;
        keywords?: boolean;
        courseSettings?: boolean;
        instructors?: boolean;
        eligibilities?: boolean;
        patrons?: boolean;
        pricing?: boolean;
    }
): Promise<CourseDeletionResult> {
    const result: CourseDeletionResult = {
        success: false,
        message: '',
        deletedItems: {},
        errors: []
    };

    const deletionPromises: Promise<void>[] = [];
    const deletionTypes: string[] = [];

    try {
        if (entities.intendedAudiences) {
            deletionPromises.push(_deleteIntendedAudiences(courseUuid));
            deletionTypes.push('intendedAudiences');
        }

        if (entities.recommendedCourses) {
            deletionPromises.push(_deleteRecommendedCourses(courseUuid));
            deletionTypes.push('recommendedCourses');
        }


        if (entities.keywords) {
            deletionPromises.push(_deleteKeywords(courseUuid));
            deletionTypes.push('keywords');
        }
        if (entities.faqs) {
            // Assuming a _deleteFaqs function exists
            // deletionPromises.push(_deleteFaqs(courseUuid));
            // deletionTypes.push('faqs');
        }
        if(entities.eligibilities) {
            deletionPromises.push(_deleteCourseEligibilities(courseUuid));
            deletionTypes.push('eligibilities');
        }
        if(entities.patrons) {
            // For now, we'll skip this or implement a deleteAllPatrons function
            deletionPromises.push(_deletePatron(courseUuid));
            deletionTypes.push('patrons');
        }
        if(entities.pricing) {
            deletionPromises.push(_deleteCoursePricing(courseUuid));
            deletionTypes.push('pricing');
        }
        if(entities.instructors) {
            deletionPromises.push(_deleteCourseInstructors(courseUuid));
            deletionTypes.push('instructors');
        }
        if(entities.courseSettings) {
            deletionPromises.push(_deleteCourseSettings(courseUuid));
            deletionTypes.push('courseSettings');
        }
        if (deletionPromises.length === 0) {
            result.success = true;
            result.message = 'No entities selected for deletion';
            return result;
        }

        // Execute all deletion operations in parallel
        const deletionResults = await Promise.allSettled(deletionPromises);

        // Track results
        deletionResults.forEach((deleteResult, index) => {
            const deletionType = deletionTypes[index] as keyof NonNullable<CourseDeletionResult['deletedItems']>;

            if (deleteResult.status === 'fulfilled') {
                result.deletedItems![deletionType] = true;
            } else {
                result.deletedItems![deletionType] = false;
                result.errors!.push(`Failed to delete ${deletionType}: ${deleteResult.reason.message}`);
            }
        });

        const hasErrors = result.errors!.length > 0;
        result.success = !hasErrors;
        result.message = hasErrors
            ? 'Some related data could not be deleted'
            : 'Related course data deleted successfully';

        return result;

    } catch (error) {
        console.error('Error deleting related course data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        result.success = false;
        result.message = errorMessage;
        result.errors!.push(errorMessage);

        return result;  
    }
}

// Export wrapped functions with automatic cache invalidation
export const deleteIntendedAudiences = withCacheInvalidation(_deleteIntendedAudiences, 'courses');
export const deleteRecommendedCourses = withCacheInvalidation(_deleteRecommendedCourses, 'courses');
export const deleteKeywords = withCacheInvalidation(_deleteKeywords, 'courses');
export const deleteCourse = withCacheInvalidation(_deleteCourse, 'courses');
export const deleteCompletelyCoursely = withCacheInvalidation(_deleteCompletelyCoursely, 'courses');
export const deleteRelatedCourseData = withCacheInvalidation(_deleteRelatedCourseData, 'courses');
export const deleteCourseSettings = withCacheInvalidation(_deleteCourseSettings, 'courses');
export const deleteCourseInstructors = withCacheInvalidation(_deleteCourseInstructors, 'courses');
export const deleteCourseEligibilities = withCacheInvalidation(_deleteCourseEligibilities, 'courses');
export const deletePatron = withCacheInvalidation(_deletePatron, 'courses');
export const deleteCoursePricing = withCacheInvalidation(_deleteCoursePricing, 'courses');

