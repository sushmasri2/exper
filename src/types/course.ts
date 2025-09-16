export interface Course {
  id: number;
  course_name: string;
  coursecode: string;
  description: string;
  slug: string;
  category: string;
  course_type: string;
  priceruppees: number;
  pricedollars: number;
  duration: string;
  status: 'active' | 'inactive';
  [key: string]: unknown; // Add index signature to satisfy Record<string, unknown>
}