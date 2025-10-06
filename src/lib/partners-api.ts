import { fetchWithHeaders } from './api-client';
import { withCacheInvalidation } from './cache-utils';
import type {
  CreatePartnerData,
  UpdatePartnerData,
  PositionUpdate,
  PaginatedPartnersResponse,
  GroupedPartnersResponse,
  PartnerGroupsResponse,
  PartnerResponse,
  PartnersFilterParams,
} from '../types/partners';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_COURSE || 'http://localhost:9005';

/**
 * Get paginated partners with optional filtering
 */
export async function getPaginatedPartners(
  params: PartnersFilterParams = {}
): Promise<PaginatedPartnersResponse> {
  const { page = 1, limit = 10, group_name, search } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (group_name) queryParams.append('group_name', group_name);
  if (search) queryParams.append('search', search);

  const fullUrl = `${baseUrl}/api/partners?${queryParams.toString()}`;

  const response = await fetchWithHeaders(fullUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch partners: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get partners grouped by group_name
 */
export async function getGroupedPartners(): Promise<GroupedPartnersResponse> {
  const fullUrl = `${baseUrl}/api/partners/grouped`;

  const response = await fetchWithHeaders(fullUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch grouped partners: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get unique group names
 */
export async function getPartnerGroups(): Promise<PartnerGroupsResponse> {
  const fullUrl = `${baseUrl}/api/partners/groups`;

  const response = await fetchWithHeaders(fullUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch partner groups: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get partner by UUID
 */
export async function getPartner(uuid: string): Promise<PartnerResponse> {
  const fullUrl = `${baseUrl}/api/partners/${uuid}`;

  const response = await fetchWithHeaders(fullUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch partner: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new partner
 */
export const createPartner = withCacheInvalidation(
  async (data: CreatePartnerData): Promise<PartnerResponse> => {
    const fullUrl = `${baseUrl}/api/partners`;

    const response = await fetchWithHeaders(fullUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create partner: ${response.statusText}`);
    }

    return response.json();
  },
  'partners'
);

/**
 * Update an existing partner
 */
export const updatePartner = withCacheInvalidation(
  async (uuid: string, data: UpdatePartnerData): Promise<PartnerResponse> => {
    const fullUrl = `${baseUrl}/api/partners/${uuid}`;

    const response = await fetchWithHeaders(fullUrl, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update partner: ${response.statusText}`);
    }

    return response.json();
  },
  'partners'
);

/**
 * Delete a partner
 */
export const deletePartner = withCacheInvalidation(
  async (uuid: string): Promise<{ status: string; message: string }> => {
    const fullUrl = `${baseUrl}/api/partners/${uuid}`;

    const response = await fetchWithHeaders(fullUrl, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete partner: ${response.statusText}`);
    }

    return response.json();
  },
  'partners'
);

/**
 * Update partner position within group
 */
export const updatePartnerPosition = withCacheInvalidation(
  async (uuid: string, data: PositionUpdate): Promise<PartnerResponse> => {
    const fullUrl = `${baseUrl}/api/partners/${uuid}/position`;

    const response = await fetchWithHeaders(fullUrl, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update partner position: ${response.statusText}`);
    }

    return response.json();
  },
  'partners'
);