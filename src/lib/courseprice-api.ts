// src/lib/course-pricing-api.ts
import { CoursePricing } from '../types/course-pricing';
import { fetchWithHeaders } from './api-client';
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || '';

export async function getCoursePricing(courseUuid: string): Promise<CoursePricing[]> {
  try {
    const fullUrl = `${baseUrl}/api/courses/${courseUuid}/pricing`;

    const response = await fetchWithHeaders(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // Normalize various possible API shapes to always return CoursePricing[]
    // Possible shapes observed:
    // - { data: CoursePricing[] }
    // - { data: { pricing: CoursePricing[], course_uuid: string } }
    // - { pricing: CoursePricing[], course_uuid: string }
    // - CoursePricing[]
    const data = result?.data ?? result;

    type LoosePricing = {
      [key: string]: unknown;
      price?: unknown;
      future_price?: unknown;
      extended_validity_price?: unknown;
      major_update_price?: unknown;
    };

    const coerce = (arr: unknown[]): CoursePricing[] => {
      return arr.map((p) => {
        const obj = p as LoosePricing;
        return {
          ...(obj as Record<string, unknown>),
          price: obj.price != null ? Number(obj.price as number | string) : (obj.price as number | undefined),
          future_price: obj.future_price != null ? Number(obj.future_price as number | string) : (obj.future_price as number | undefined),
          extended_validity_price: obj.extended_validity_price != null ? Number(obj.extended_validity_price as number | string) : (obj.extended_validity_price as number | undefined),
          major_update_price: obj.major_update_price != null ? Number(obj.major_update_price as number | string) : (obj.major_update_price as number | undefined),
        } as unknown as CoursePricing;
      });
    };

    if (Array.isArray(data)) {
      return coerce(data);
    }

    if (data && Array.isArray(data.pricing)) {
      return coerce(data.pricing);
    }

    throw new Error('Unexpected course pricing response structure');

  } catch (error) {
    console.error('Error fetching course pricing:', error);
    throw error;
  }
}
// In courseprice-api.ts
export async function updateCoursePricing(
  courseUuid: string,
  pricingId: number,
  pricingData: Partial<CoursePricing>
): Promise<void> {
  try {
    const fullUrl = `${baseUrl}/api/courses/${courseUuid}/pricing/${pricingId}`;

    // Validate that currency is present and not undefined if it exists
    if (pricingData.currency && pricingData.currency !== undefined) {
      pricingData.currency = String(pricingData.currency).toUpperCase();
    }

    // Ensure clean JSON serialization
    const cleanData = JSON.parse(JSON.stringify(pricingData));


    const response = await fetchWithHeaders(fullUrl, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanData),
    });
    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.json();
        console.error('API Error Response:', errorBody);
        if (errorBody.message) {
          errorMessage += ` - ${errorBody.message}`;
        }
        if (errorBody.errors) {
          errorMessage += ` - Validation errors: ${JSON.stringify(errorBody.errors)}`;
        }
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error updating course pricing:', error);
    throw error;
  }
}

export async function createCoursePricing(
  courseUuid: string,
  pricingData: Partial<CoursePricing>[]
): Promise<void> {
  try {
    const fullUrl = `${baseUrl}/api/courses/${courseUuid}/pricing`;

    // Validate that currency is always present and not undefined
    const validatedPricingData = pricingData.map(item => {
      if (!item.currency) {
        throw new Error('Currency field is required and cannot be undefined');
      }
      return {
        ...item,
        currency: String(item.currency).toUpperCase() // Ensure it's a string and uppercase
      };
    });

    // Send the first item directly (not wrapped in array or pricing object)
    const payload = validatedPricingData[0];


    const response = await fetchWithHeaders(fullUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload), // Send the object directly
    });

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.json();
        console.error('API Error Response:', errorBody);
        if (errorBody.message) {
          errorMessage += ` - ${errorBody.message}`;
        }
        if (errorBody.errors) {
          errorMessage += ` - Validation errors: ${JSON.stringify(errorBody.errors)}`;
        }
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error creating course pricing:', error);
    throw error;
  }
}
