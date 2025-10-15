export interface CoursePricing {
  uuid: string;
  currency: string;
  currency_code: string;
  price: number;
  striked_price: number;
  formatted_price: string;
  formatted_striked_price: string | null;
  extended_validity_price: number;
  major_update_price: number;
  future_price_effect_from: string | null;
}

export interface Course {
  id: number;
  uuid: string;
  course_name: string;
  title: string;
  course_card_title: string;
  one_line_description: string;
  short_description: string | null;
  description: string | null;
  duration: string;
  category_id: number;
  course_type_id: number;
  category_name: string;
  location: string | null;
  status: number;   // 1 = active, 0 = inactive
  version: string;
  no_price: number; // 1 = free, 0 = paid
  type_name: string;
  seo_title: string;
  seo_description: string | null;
  seo_url: string;
  sem_url: string;
  pricing: CoursePricing[];
  [key: string]: unknown; // Add index signature to satisfy Record<string, unknown>
}

export interface PaginatedCoursesResponse {
  data: Course[];
  pagination: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
    links: {
      next: string | null;
      prev: string | null;
      first: string;
      last: string;
    };
  };
}

export interface CoursesFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  courseType?: string;
  type?: string | number; // Add type property for course type
  sortBy?: string;
  view?: 'grid' | 'list';
  [key: string]: string | number | undefined;
}

// Validation error types
export interface ValidationError {
    field: string;
    message: string;
    type: 'required' | 'format' | 'length' | 'range' | 'custom';
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

// Field validation rules
export interface FieldValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    min?: number;
    max?: number;
    custom?: (value: unknown) => string | null;
}