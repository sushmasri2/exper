export interface CourseCategory {
  id: number;
  uuid: string;
  name: string;
  description: string;
  short_code: string;
  image: string;
  color_code: string;
  background_color_code: string;
  position: number;
  slug: string;
  status: number; // 1 = active, 0 = inactive
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
