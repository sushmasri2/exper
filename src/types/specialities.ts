export interface Specialty {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IntendedAudience {
  id: number;
  course_id: number;
  specialities_id: number;
  position: number;
  created_at: string;
  updated_at: string;
  course: {
    id: number;
    uuid: string;
    course_name: string;
    short_description: string;
  };
}

export interface IntendedAudienceResponse {
  status: string;
  data: {
    course: {
      id: number;
      uuid: string;
      name: string;
    };
    intendedAudiences: IntendedAudience[];
  };
}