export interface AccreditationPartner {
  id: string;
  uuid: string;
  name: string;
  image_url: string;
  position: number;
  created_at: string;
  updated_at: string;
}   

export interface AccreditationPartnerResponse {
  data: AccreditationPartner[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface CourseAccreditationPartnerItem {
  id: number;
  course_id: number;
  accreditation_partner_id: number;
  status: number;
  created_at: string;
  updated_at: string;
  AccreditationPartner: {
    id: number;
    uuid: string;
    name: string;
    image_url: string;
    position: number;
  };
}