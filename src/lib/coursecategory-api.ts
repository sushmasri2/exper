import { CourseCategory, PaginatedResponse, CategoryCreateRequest, CategoryUpdateRequest, ApiResponse } from '@/types/coursecategory';
import { fetchWithHeaders } from './api-client';
import { withCacheInvalidation } from './cache-utils';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';

export async function getCoursesCategory(): Promise<CourseCategory[]> {
  try {
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }

    let allCategories: CourseCategory[] = [];
    let page = 1;
    let hasMore = true;
    const pageSize = 100; // Adjust as needed for your API

    while (hasMore) {
      const fullUrl = `${baseUrl}/api/categories?page=${page}&limit=${pageSize}`;
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

      if (result.success !== undefined && !result.success) {
        throw new Error(result.message || 'Unknown API error');
      }

      let categories: CourseCategory[] = [];
      if (result.data) {
        categories = result.data;
      } else if (Array.isArray(result)) {
        categories = result;
      } else {
        throw new Error('Unexpected response structure');
      }

      allCategories = allCategories.concat(categories);

      // If less than pageSize returned, assume last page
      if (categories.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return allCategories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the API');
    }
    throw error;
  }
}

export async function getCoursesCategoryPaginated(page: number = 1, limit: number = 12): Promise<PaginatedResponse<CourseCategory>> {
  try {
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }

    const fullUrl = `${baseUrl}/api/categories?page=${page}&limit=${limit}`;
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

    if (result.success !== undefined && !result.success) {
      throw new Error(result.message || 'Unknown API error');
    }

    // Handle different response structures
    if (result.data && result.pagination) {
      return {
        data: result.data,
        pagination: result.pagination
      };
    } else if (Array.isArray(result.data)) {
      // If API doesn't return pagination metadata, create a basic one
      return {
        data: result.data,
        pagination: {
          total: result.data.length,
          totalPages: Math.ceil(result.data.length / limit),
          page: page,
          limit: limit,
          hasNext: false,
          hasPrev: false,
          links: {
            next: null,
            prev: null,
            first: `${baseUrl}/api/categories?page=1&limit=${limit}`,
            last: `${baseUrl}/api/categories?page=1&limit=${limit}`
          }
        }
      };
    } else if (Array.isArray(result)) {
      // If the result is directly an array (legacy API response)
      return {
        data: result,
        pagination: {
          total: result.length,
          totalPages: Math.ceil(result.length / limit),
          page: page,
          limit: limit,
          hasNext: false,
          hasPrev: false,
          links: {
            next: null,
            prev: null,
            first: `${baseUrl}/api/categories?page=1&limit=${limit}`,
            last: `${baseUrl}/api/categories?page=1&limit=${limit}`
          }
        }
      };
    } else {
      throw new Error('Unexpected response structure');
    }
  } catch (error) {
    console.error('Error fetching paginated categories:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the API');
    }
    throw error;
  }
}
export async function getCategoryByUuid(uuid: string): Promise<CourseCategory> {
  try {
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }
    const fullUrl = `${baseUrl}/api/categories/${uuid}`;
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
    const result: ApiResponse<CourseCategory> = await response.json();
    if (result.status !== 'success') {
      throw new Error(result.message || 'Unknown API error');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching category by UUID:', error);
    throw error;
  }

}

export async function getCategoryById(id: number): Promise<CourseCategory> {
  try {
    // First, get all categories to find the one with the matching ID
    const allCategories = await getCoursesCategory();
    const category = allCategories.find(cat => cat.id === id);

    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }

    // Now fetch the full category data using the UUID
    return await getCategoryByUuid(category.uuid);
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    throw error;
  }
}

async function _updateCategory(uuid: string, categoryData: CategoryUpdateRequest): Promise<CourseCategory> {
  try {
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }
    const fullUrl = `${baseUrl}/api/categories/${uuid}`;
    const response = await fetchWithHeaders(fullUrl, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error Response:', errorText);
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<CourseCategory> = await response.json();
    if (result.status !== 'success') {
      throw new Error(result.message || 'Unknown API error');
    }

    return result.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

async function _deleteCategory(uuid: string): Promise<{ status: string; message: string }> {
  try {
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }
    const fullUrl = `${baseUrl}/api/categories/${uuid}`;
    const response = await fetchWithHeaders(fullUrl, {
      method: 'DELETE',
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

    const result: ApiResponse<null> = await response.json();
    if (result.status !== 'success') {
      throw new Error(result.message || 'Unknown API error');
    }

    return {
      status: result.status,
      message: result.message
    };
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

async function _createCategory(categoryData: CategoryCreateRequest): Promise<CourseCategory> {
  try {
    if (!baseUrl) {
      throw new Error('API base URL is not defined');
    }
    const fullUrl = `${baseUrl}/api/categories`;
    const response = await fetchWithHeaders(fullUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error Response:', errorText);
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<CourseCategory> = await response.json();
    if (result.status !== 'success') {
      throw new Error(result.message || 'Unknown API error');
    }

    return result.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

// Export wrapped functions with automatic cache invalidation
export const createCategory = withCacheInvalidation(_createCategory, 'categories');
export const updateCategory = withCacheInvalidation(_updateCategory, 'categories');
export const deleteCategory = withCacheInvalidation(_deleteCategory, 'categories');
