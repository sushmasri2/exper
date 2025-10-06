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

export async function updateCoursePricing(courseUuid: string, pricingData: Partial<CoursePricing>[]): Promise<void> {
  try {
    const fullUrl = `${baseUrl}/api/courses/${courseUuid}/pricing`;
    const response = await fetchWithHeaders(fullUrl, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pricing: pricingData }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error updating course pricing:', error);
    throw error;
  }

}
