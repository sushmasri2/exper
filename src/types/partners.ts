export interface Partner {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  image_url?: string;
  web_url?: string;
  group_name: string;
  position?: number;
  created_at: string;
  updated_at: string;
}

export interface PartnerInput {
  name: string;
  description?: string;
  image_url?: string;
  web_url?: string;
  group_name: string;
  position?: number;
}

export type CreatePartnerData = PartnerInput;

export type UpdatePartnerData = Partial<PartnerInput>;

export interface PositionUpdate {
  position: number;
}

export interface PartnersFilterParams {
  page?: number;
  limit?: number;
  group_name?: string;
  search?: string;
}

export interface PaginatedPartnersResponse {
  status: string;
  data: Partner[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GroupedPartnersResponse {
  status: string;
  data: Record<string, Partner[]>;
}

export interface PartnerGroupsResponse {
  status: string;
  data: string[];
}

export interface PartnerResponse {
  status: string;
  data: Partner;
  message?: string;
}