export interface FAQs {
  id: number;
  uuid: string;
  course_id: number;
  question: string;
  answers: string;
  position: number;
  status: number;
  created_at: string;
  updated_at: string;
  languages: [];
}

export interface CourseFAQsResponse {
  status: string;
  data: FAQs[];
  course: {
    uuid: string;
    name: string;
    title: string;
  };
}
