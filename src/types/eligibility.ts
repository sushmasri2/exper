export interface Eligibility {
  id: string;
  uuid: string;
  name: string;
  description: string;
  course_id: string;
  eligibility_criteria: string;
  created_at: string;
  updated_at: string;
}   


export interface CourseEligibilityResponse {
  status: string;
  data: {
    course_uuid: string;
    eligibilities: {
      id: number;
      eligibility_uuid: string;
      eligibility_name: string;
      eligibility_status: number;
      created_at: string;
      updated_at: string;
    }[];
  };
}