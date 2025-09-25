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