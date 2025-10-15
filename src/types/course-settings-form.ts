/**
 * Course Settings Form Data Types
 * This file contains type definitions specifically for the course settings form
 * Combines fields from both Courses and CourseSetting models
 */

export interface CourseSettingsFormData {
  // Primary fields from Courses model
  id?: number;
  uuid?: string;
  course_name?: string;
  title?: string;
  course_card_title?: string;
  one_line_description?: string;
  short_description?: string | null;
  description?: string | null;
  category_id?: number;
  course_type_id?: number;
  version?: string;
  seo_title?: string;
  seo_description?: string | null;
  seo_url?: string;
  sem_url?: string;
  kite_id?: number | null;
  course_zoho_id?: string | null;
  duration?: string;
  cpd_points?: number;
  active_learners?: number;
  rating_count?: number;
  rating?: number;
  no_price?: number;
  location?: string | null;
  status?: number;

  // Fields from CourseSetting model
  banner?: string | null;
  overview?: string;
  course_demo?: string | null;
  duration_years?: number;
  duration_months?: number;
  duration_days?: number;
  schedule?: string;
  end_date?: string | null;
  y_month?: number | null;
  y_day?: number | null;
  m_month?: number | null;
  m_day?: number | null;
  w_week?: number | null;
  w_days?: string;
  d_days?: number | null;
  extendedvalidity_years?: number | null;
  extendedvalidity_months?: number | null;
  extendedvalidity_days?: number | null;
  accreditation?: string | null;
  brochure?: string | null;
  course_demo_mobile?: string | null;
  course_start_date?: string | null;
  financial_aid?: string | null;
  is_preferred_course?: number;
  what_you_will_learn?: string | null;
  course_demo_url?: string;
  course_demo_mobile_url?: string;
  children_course?: string | null;
  is_kyc_required?: number;
  banner_alt_tag?: string | null;
  enable_contact_programs?: number;
  enable_index_tag?: number;
  thumbnail_mobile?: string | null;
  thumbnail_web?: string | null;
  partner_coursecode?: string | null;
  speciality_courses_ordering?: number | null;
  disclosure?: string | null;
  summary?: string | null;
  speciality_type?: string | null;

  // Additional computed or display fields
  category_name?: string;
  type_name?: string;

  // Timestamps
  created_at?: string;
  updated_at?: string;

  // Index signature for additional fields
  [key: string]: unknown;
}

/**
 * Partial type for form data - all fields are optional
 */
export type CourseSettingsPartialFormData = Partial<CourseSettingsFormData>;