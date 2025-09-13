export interface Course {
  id: number;
  title: string;
  coursecode: string;
  description: string;
  slug: string;
  category: string;
  coursetype: string;
  priceruppees: number;
  pricedollars: number;
  duration: string;
  status: 'active' | 'inactive';
}