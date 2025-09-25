export interface Course {
  id: number;
  uuid: string;
  category_id: number; // foreign key -> course_categories.id
  course_code: string;
  short_code: string;
  course_name: string;
  title: string;
  course_card_title: string;
  one_line_description: string;
  short_description: string;
  description: string;
  course_type_id: number; // foreign key -> course_type.id
  parent_version_id: number | null;
  version: number;
  seo_title: string;
  seo_description: string;
  seo_url: string;
  sem_url: string;
  kite_id: string | null;
  course_zoho_id: string | null;
  cpd_points: number;
  active_learners: number;
  rating_count: number;
  rating: number;
  no_price: number; // 1 = free, 0 = paid
  status: number;   // 1 = active, 0 = inactive
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  priceruppees: number;
  pricedollars: number;
  duration: string;
  [key: string]: unknown; // Add index signature to satisfy Record<string, unknown>
}

