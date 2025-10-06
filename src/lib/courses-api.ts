import { Course,PaginatedCoursesResponse,CoursesFilterParams } from "@/types/course";
import { fetchWithHeaders } from './api-client';
import { withCacheInvalidation } from './cache-utils';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';




export async function getCourses(): Promise<Course[]> {
  try {

    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }

    const fullUrl = `${baseUrl}/api/courses`;

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
      const errorText = await response.text();
      console.log('Error Response:', errorText);
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // Check if response has the expected structure
    if (result.success !== undefined && !result.success) {
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

export async function getPaginatedCourses(params: CoursesFilterParams = {}): Promise<PaginatedCoursesResponse> {
  try {
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }

    // Build query parameters
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.category) searchParams.append('category', params.category);
    if (params.courseType) searchParams.append('type', params.courseType);

    const fullUrl = `${baseUrl}/api/courses?${searchParams.toString()}`;

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

    // Check if response has the expected structure
    if (result.success !== undefined && !result.success) {
      throw new Error(result.message || 'Unknown API error');
    }

    // If the API doesn't return paginated data, create a mock pagination structure
    if (result.data && Array.isArray(result.data)) {
      // Check if it has pagination metadata
      if (result.pagination) {
        return {
          data: result.data,
          pagination: result.pagination
        };
      } else {
        // Create mock pagination for non-paginated response
        const data = result.data;
        const total = data.length;
        const page = params.page || 1;
        const limit = params.limit || 10;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = data.slice(startIndex, endIndex);

        return {
          data: paginatedData,
          pagination: {
            total,
            totalPages,
            page,
            limit,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            links: {
              next: page < totalPages ? `?page=${page + 1}` : null,
              prev: page > 1 ? `?page=${page - 1}` : null,
              first: `?page=1`,
              last: `?page=${totalPages}`
            }
          }
        };
      }
    } else if (Array.isArray(result)) {
      // Handle case where response is direct array
      const data = result;
      const total = data.length;
      const page = params.page || 1;
      const limit = params.limit || 10;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = data.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        pagination: {
          total,
          totalPages,
          page,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          links: {
            next: page < totalPages ? `?page=${page + 1}` : null,
            prev: page > 1 ? `?page=${page - 1}` : null,
            first: `?page=1`,
            last: `?page=${totalPages}`
          }
        }
      };
    } else {
      throw new Error('Unexpected response structure');
    }

  } catch (error) {
    console.error('Error fetching paginated courses:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the API');
    }

    throw error;
  }
}
async function _UpdateCourse(courseUuid: string): Promise<Course> {
  try {
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }
    const fullUrl = `${baseUrl}/api/courses/${courseUuid}`;

    // Try without interceptor first - use plain fetch
    const response = await fetchWithHeaders(fullUrl, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Remove credentials if not needed
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error Response:', errorText);
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    // Check if response has the expected structure
    if (result.success !== undefined && !result.success) {
      throw new Error(result.message || 'Unknown API error');
    }
    // Handle different response structures
    if (result.data) {
      return result.data;
    } else if (Array.isArray(result)) {
      return result[0]; // Assuming you want the first item if it's an array
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
async function _CreateCourse(): Promise<Course> {
  try {
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }
    const fullUrl = `${baseUrl}/api/courses`;
    // Try without interceptor first - use plain fetch
    const response = await fetchWithHeaders(fullUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Remove credentials if not needed
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error Response:', errorText);
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    const result = await response.json();
    // Check if response has the expected structure
    if (result.success !== undefined && !result.success) {
      throw new Error(result.message || 'Unknown API error');
    }
    // Handle different response structures
    if (result.data) {
      return result.data;
    }
    else if (Array.isArray(result)) {
      return result[0]; // Assuming you want the first item if it's an array
    }
    else {
      throw new Error('Unexpected response structure');
    }
  } catch (error) {
    console.error('Error creating course:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the API');
    }
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      throw new Error('Response parsing error: Invalid JSON received from the API');
    }
    if (error instanceof Error && error.message.includes('HTTP error')) {
      throw error; // Re-throw HTTP errors as is
    }
    throw error;
  }
}
async function _DeleteCourse(courseUuid: string): Promise<void> {
  try {
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }
    const fullUrl = `${baseUrl}/api/courses/${courseUuid}`;
    // Try without interceptor first - use plain fetch
    const response = await fetchWithHeaders(fullUrl, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Remove credentials if not needed
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error Response:', errorText);
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    const result = await response.json();
    // Check if response has the expected structure
    if (result.success !== undefined && !result.success) {
      throw new Error(result.message || 'Unknown API error');
    }
    // Assuming a successful delete returns no data
    return;
  }
  catch (error) {
    console.error('Error deleting course:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the API');
    }
  }
}

// Export wrapped functions with automatic cache invalidation
export const UpdateCourse = withCacheInvalidation(_UpdateCourse, 'courses');
export const CreateCourse = withCacheInvalidation(_CreateCourse, 'courses');
export const DeleteCourse = withCacheInvalidation(_DeleteCourse, 'courses');
