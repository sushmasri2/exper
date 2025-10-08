import { Course,PaginatedCoursesResponse,CoursesFilterParams } from "@/types/course";
import { fetchWithHeaders } from './api-client';
import { withCacheInvalidation } from './cache-utils';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';

export interface CreateCourseData {
  category_id: number;
  course_type_id: number;
  course_code: string;
  short_code: string;
  course_name: string;
  course_card_title: string;
  one_line_description: string;
}

interface ValidationError extends Error {
  validationErrors?: Record<string, string[]>;
  isValidationError?: boolean;
}

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
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);

    const fullUrl = `${baseUrl}/api/courses?${searchParams.toString()}`;
    console.log('API Request URL:', fullUrl);
    console.log('Filter params:', params);

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

        console.log(`Mock pagination: total=${total}, page=${page}, limit=${limit}, totalPages=${totalPages}`);
        console.log(`Slice: startIndex=${startIndex}, endIndex=${endIndex}, showing ${paginatedData.length} of ${total} items`);

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

      console.log(`Direct array pagination: total=${total}, page=${page}, limit=${limit}, totalPages=${totalPages}`);
      console.log(`Slice: startIndex=${startIndex}, endIndex=${endIndex}, showing ${paginatedData.length} of ${total} items`);

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
async function _CreateCourse(courseData: CreateCourseData): Promise<Course> {
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
      body: JSON.stringify(courseData),
      // Remove credentials if not needed
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error Response:', errorText);
      
      // Try to parse validation errors from the response
      try {
        const errorData = JSON.parse(errorText);
        
        // Handle field validation errors
        if (errorData.errors) {
          const validationError = new Error(errorData.message || 'Validation failed') as ValidationError;
          validationError.validationErrors = errorData.errors;
          validationError.isValidationError = true;
          throw validationError;
        }
        
        // Handle specific constraint errors (like duplicate values)
        if (errorData.error && errorData.message) {
          const constraintError = new Error(errorData.message) as ValidationError;
          constraintError.isValidationError = true;
          
          // Map specific constraint errors to form fields
          const constraintErrors: Record<string, string[]> = {};
          
          if (errorData.error === 'DUPLICATE_SHORT_CODE') {
            constraintErrors['short_code'] = [errorData.message];
          } else if (errorData.error === 'DUPLICATE_COURSE_CODE') {
            constraintErrors['course_code'] = [errorData.message];
          } else if (errorData.error === 'DUPLICATE_COURSE_NAME') {
            constraintErrors['course_name'] = [errorData.message];
          }
          // Add more constraint mappings as needed
          
          if (Object.keys(constraintErrors).length > 0) {
            constraintError.validationErrors = constraintErrors;
          }
          
          throw constraintError;
        }
      } catch (parseError) {
        // If parsing fails, fall back to generic error
        console.log('Could not parse error response as JSON');
        
        // Re-throw the validation/constraint error if it was already created
        if (parseError instanceof Error && (parseError as ValidationError).isValidationError) {
          throw parseError;
        }
      }
      
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

async function _GetCourseByUuid(courseUuid: string): Promise<Course> {
  try {
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }
    const fullUrl = `${baseUrl}/api/courses/${courseUuid}`;

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

    // Handle different response structures
    if (result.data) {
      return result.data;
    } else if (result.id) {
      // If the API returns the course object directly
      return result;
    } else {
      throw new Error('Unexpected response structure');
    }

  } catch (error) {
    console.error('Error fetching course by UUID:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the API');
    }
    throw error;
  }
}

// Alternative function to try numeric ID first (in case API supports both)
async function _GetCourseByIdDirect(courseId: number): Promise<Course> {
  try {
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }
    const fullUrl = `${baseUrl}/api/courses/id/${courseId}`;

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

    // Handle different response structures
    if (result.data) {
      return result.data;
    } else if (result.id) {
      // If the API returns the course object directly
      return result;
    } else {
      throw new Error('Unexpected response structure');
    }

  } catch (error) {
    console.error('Error fetching course by numeric ID:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the API');
    }
    throw error;
  }
}



// Composite function that tries UUID first, then falls back to ID as requested
async function _GetCourseById(courseIdOrUuid: number | string): Promise<Course> {
  if (typeof courseIdOrUuid === 'string') {
    // If it's a string, assume it's a UUID and try fetching by UUID first
    console.log(`Attempting to fetch course by UUID: ${courseIdOrUuid}`);
    
    try {
      const course = await _GetCourseByUuid(courseIdOrUuid);
      console.log(`Successfully fetched course by UUID: ${courseIdOrUuid}`);
      return course;
    } catch (error) {
      console.log(`Failed to fetch by UUID: ${courseIdOrUuid}, error:`, error);
      throw error;
    }
  } else {
    // If it's a number, we need to try UUID first (as requested), then fall back to ID
    console.log(`Attempting to fetch course for ID: ${courseIdOrUuid}`);
    
    // Step 1: Try to find the UUID first by getting the course from the list
    try {
      console.log('Step 1: Getting courses list to find UUID...');
      const courses = await getCourses();
      const foundCourse = courses.find(c => c.id === courseIdOrUuid);
      
      if (foundCourse && foundCourse.uuid) {
        console.log(`Found course in list with UUID: ${foundCourse.uuid}, now fetching by UUID...`);
        
        // Step 2: Try fetching by UUID first (as requested)
        try {
          const course = await _GetCourseByUuid(foundCourse.uuid);
          console.log(`Successfully fetched course by UUID: ${foundCourse.uuid}`);
          return course;
        } catch {
          console.log(`Failed to fetch by UUID: ${foundCourse.uuid}, falling back to ID...`);
          // Fall through to direct ID fetch
        }
      } else {
        console.log(`Course with ID ${courseIdOrUuid} not found in list, trying direct ID fetch...`);
        // Fall through to direct ID fetch
      }
    } catch (listError) {
      console.log('Failed to get courses list, trying direct ID fetch...', listError);
      // Fall through to direct ID fetch
    }
    
    // Step 3: Fall back to direct ID fetch if UUID approach failed
    try {
      console.log(`Falling back to direct ID fetch for: ${courseIdOrUuid}`);
      const course = await _GetCourseByIdDirect(courseIdOrUuid);
      console.log(`Successfully fetched course by direct ID: ${courseIdOrUuid}`);
      return course;
    } catch (idError) {
      console.error(`Failed to fetch course by ID: ${courseIdOrUuid}`, idError);
      throw new Error(`Course with ID ${courseIdOrUuid} not found`);
    }
  }
}

// Export wrapped functions with automatic cache invalidation
export const GetCourseById = withCacheInvalidation(_GetCourseById, 'courses');
export const GetCourseByUuid = withCacheInvalidation(_GetCourseByUuid, 'courses');
export const GetCourseByIdDirect = withCacheInvalidation(_GetCourseByIdDirect, 'courses');
export const UpdateCourse = withCacheInvalidation(_UpdateCourse, 'courses');
export const CreateCourse = withCacheInvalidation(_CreateCourse, 'courses');
export const DeleteCourse = withCacheInvalidation(_DeleteCourse, 'courses');
