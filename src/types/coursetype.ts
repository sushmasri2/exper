export interface CourseType {
  id: number;
  uuid: string;
  name: string;
  description: string;
  image: string;
  code: string;
  position: number;
  status: number; // 1 = active, 0 = inactive
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
