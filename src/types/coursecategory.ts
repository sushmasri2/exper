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
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
    links: {
      next: string;
      prev: string;
      first: string;
      last: string;
    };
  };
}