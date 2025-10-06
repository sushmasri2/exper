import { CourseType } from "@/types/coursetype";
import { fetchWithHeaders } from './api-client';
import { withCacheInvalidation } from './cache-utils';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';
export async function getCoursesType(): Promise<CourseType[]> {
  try {

    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }

    const fullUrl = `${baseUrl}/api/course-types`;

    // Try without interceptor first - use plain fetch
    const response = await fetchWithHeaders(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Remove credentials if not needed
    });


    if (!response.ok) {
      let errorMessage = `Failed to fetch course types (${response.status}: ${response.statusText})`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If JSON parsing fails, use the response text
        const errorText = await response.text();
        console.error('Error Response:', errorText);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    // Check if response has the expected structure
    if (result.status && result.status !== 'success') {
      throw new Error(result.message || 'Unknown API error');
    }

    // Handle different response structures
    if (result.data) {
      return result.data;
    } else if (Array.isArray(result)) {
      return result;
    } else {
      throw new Error('Unexpected response structure');
    }

  } catch (error) {
    console.error('Error fetching course type:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the API');
    }

    throw error;
  }
}
async function _createCourseType(courseType: Partial<CourseType>): Promise<CourseType> {
  try {
    if(!baseUrl) {
      throw new Error('API base URL is not defined');
    }

    console.log('Creating course type:', { courseType, url: `${baseUrl}/api/course-types` });

    const response = await fetchWithHeaders(`${baseUrl}/api/course-types`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',

      },
      body: JSON.stringify(courseType),
    });
    if (!response.ok) {
      let errorMessage = `Failed to create course type (${response.status}: ${response.statusText})`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If JSON parsing fails, use the response text
        const errorText = await response.text();
        console.error('Error Response:', errorText);
      }
      throw new Error(errorMessage);
    }

    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      throw new Error('Invalid JSON response from server');
    }

    console.log('Create response:', result);

    if (result.status && result.status !== 'success') {
      throw new Error(result.message || 'Failed to create course type');
    }
    return result.data;
  } catch (error) {
    console.error('Error creating course type:', error);
    throw error;
  }
}
async function _updateCourseType(uuid: string, courseType: Partial<CourseType>): Promise<CourseType> {
  try {
    if(!baseUrl) {
      throw new Error('API base URL is not defined');
    }

    console.log('Updating course type:', { uuid, courseType, url: `${baseUrl}/api/course-types/${uuid}` });

    const response = await fetchWithHeaders(`${baseUrl}/api/course-types/${uuid}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseType),
    });
    if (!response.ok) {
      let errorMessage = `Failed to update course type (${response.status}: ${response.statusText})`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If JSON parsing fails, use the response text
        const errorText = await response.text();
        console.error('Error Response:', errorText);
      }
      throw new Error(errorMessage);
    }

    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      throw new Error('Invalid JSON response from server');
    }

    console.log('Update response:', result);

    if (result.status && result.status !== 'success') {
      throw new Error(result.message || 'Failed to update course type');
    }
    return result.data;
  }
  catch (error) {
    console.error('Error updating course type:', error);
    throw error;
  }
}
async function _deleteCourseType(uuid: string): Promise<void> {
  try {
    if(!baseUrl) {
      throw new Error('API base URL is not defined');
    }

    console.log('Deleting course type:', { uuid, url: `${baseUrl}/api/course-types/${uuid}` });

    const response = await fetchWithHeaders(`${baseUrl}/api/course-types/${uuid}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },

    });
    if (!response.ok) {
      let errorMessage = `Failed to delete course type (${response.status}: ${response.statusText})`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If JSON parsing fails, use the response text
        const errorText = await response.text();
        console.error('Error Response:', errorText);
      }
      throw new Error(errorMessage);
    }

    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      throw new Error('Invalid JSON response from server');
    }

    console.log('Delete response:', result);

    if (result.status && result.status !== 'success') {
      throw new Error(result.message || 'Failed to delete course type');
    }
    return;
  } catch (error) {
    console.error('Error deleting course type:', error);
    throw error;
  }
}

// Export wrapped functions with automatic cache invalidation
export const createCourseType = withCacheInvalidation(_createCourseType, 'course-types');
export const updateCourseType = withCacheInvalidation(_updateCourseType, 'course-types');
export const deleteCourseType = withCacheInvalidation(_deleteCourseType, 'course-types');
