export interface Instructor {
  id: number;
  uuid: string;
  first_name?: string;
  last_name?: string;
  name?: string; // For backward compatibility
  bio?: string;
  description?: string;
  m_image_url?: string;
  profile_image?: string;
  designation?: string;
  position?: number;
  biography?: string;
  publications?: string;
  affiliations_memberships?: string;
  disclosure?: string;
  rating?: string;
  status?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CourseInstructorLink {
  id: number;
  course_id: number;
  instructors_id: number;
  status: number;
  created_at?: string;
  updated_at?: string;
  CourseInstructor?: Instructor;
}