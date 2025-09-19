// src/types/course-pricing.ts
export interface CoursePricing {
  id: number;
  uuid: string;
  course_id: number;
  currency: string;
  price: number;
  future_price?: number;
  future_price_effect_from?: string;
  extended_validity_price?: number;
  major_update_price?: number;
  status: number;
  created_at: string;
  updated_at: string;
}