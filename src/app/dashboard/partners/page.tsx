"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPaginatedPartners, getPartnerGroups } from "@/lib/partners-api";
import type { PartnersFilterParams, PaginatedPartnersResponse } from "@/types/partners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select2 from "@/components/ui/Select2";
import { Search, RefreshCw, Plus } from "lucide-react";
import { PageLoading } from "@/components/ui/loading-spinner";
import { PartnersTable } from "./components/PartnersTable";
import Pagination2 from "@/components/ui/pagination2";
import { useApiCache } from "@/hooks/use-api-cache";
import { setGlobalCacheInstance } from "@/lib/cache-utils";

function PartnersContent() {
  // States
  const [partnersData, setPartnersData] = useState<PaginatedPartnersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [partnerGroupsList, setPartnerGroupsList] = useState<string[]>([]);

  // Form states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

  // Navigation
  const router = useRouter();
  const searchParams = useSearchParams();

  // Cache
  const cacheInstance = useApiCache();
  const { cachedApiCall, invalidateRelatedCache } = cacheInstance;

  // Set global cache instance
  setGlobalCacheInstance(cacheInstance);

  // Initialize form values from URL params
  useEffect(() => {
    const searchParam = searchParams.get('search') || '';
    const group = searchParams.get('group') || '';

    setSearchQuery(searchParam);
    setSelectedGroup(group);
  }, [searchParams]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load groups data with caching
        const groupsResponse = await cachedApiCall(() => getPartnerGroups(), { cacheKey: 'partner-groups' });

        if (groupsResponse?.data) {
          setPartnerGroupsList(groupsResponse.data);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [cachedApiCall]);

  // Load partners with filters
  const loadPartners = useCallback(async (params: PartnersFilterParams = {}) => {
    setSearchLoading(true);
    try {
      const currentPage = parseInt(searchParams.get('page') || '1');
      const group = searchParams.get('group') || '';
      const search = searchParams.get('search') || '';

      const filterParams: PartnersFilterParams = {
        page: currentPage,
        limit: 10,
        group_name: group || undefined,
        search: search || undefined,
        ...params
      };

      // Create cache key based on params
      const cacheKey = `paginated-partners-${JSON.stringify(filterParams)}`;

      const response = await cachedApiCall(
        () => getPaginatedPartners(filterParams),
        { cacheKey }
      );

      setPartnersData(response);
    } catch (error) {
      console.error('Failed to load partners:', error);
      setPartnersData(null);
    } finally {
      setSearchLoading(false);
    }
  }, [searchParams, cachedApiCall]);

  // Load partners when URL params change
  useEffect(() => {
    if (!loading) {
      loadPartners();
    }
  }, [loadPartners, loading]);

  // Update URL with current filters
  const updateURL = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value && value.trim()) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });

    // Always reset to page 1 when filters change (except when changing page)
    if (!params.page) {
      newSearchParams.delete('page');
    }

    router.push(`/dashboard/partners?${newSearchParams.toString()}`);
  };

  // Search handler
  const handleSearch = () => {
    updateURL({
      search: searchQuery,
      group: selectedGroup
    });
  };

  // Reset handler
  const handleReset = () => {
    setSearchQuery("");
    setSelectedGroup("");
    router.push('/dashboard/partners');
  };

  // Pagination handler
  const handlePageChange = (url: string, page: number) => {
    updateURL({ page: page.toString() });
  };

  // Table sort handler
  const handleTableSort = (accessor: string, direction: 'asc' | 'desc') => {
    // TODO: Implement sorting functionality
    console.log('Sort by:', accessor, direction);
  };

  // Partner deleted handler
  const handlePartnerDeleted = async () => {
    // Invalidate partners cache and reload
    invalidateRelatedCache('partners');
    await loadPartners();
  };



  // Handle Enter key in search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Navigate to add page
  const handleAddPartner = () => {
    router.push('/dashboard/partners/add');
  };

  // Navigate to edit page
  const handleEditPartner = (uuid: string) => {
    router.push(`/dashboard/partners/${uuid}/edit`);
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen bg-background" style={{
      margin: '-1rem',
      padding: '0',
      width: 'calc(100% + 2rem)'
    }}>
      {/* Header and Filters */}
      <div className="sticky top-0 z-[15] bg-background/95 shadow-sm border-b backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-foreground">
              Partners
              {partnersData && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({partnersData.pagination.total} total)
                </span>
              )}
            </h1>
            <Button onClick={handleAddPartner} className="shrink-0" variant={"outlineSecondary"}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Partner
            </Button>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            {/* Search Input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Search Partners
              </label>
              <Input
                placeholder="Search by name, description, or website URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>

            {/* Group Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Partner Group
              </label>
              <Select2
                value={selectedGroup}
                onChange={(value) => setSelectedGroup(typeof value === 'string' ? value : '')}
                placeholder="All Groups"
                options={[
                  { value: "", label: "All Groups" },
                  ...partnerGroupsList.map(groupName => ({
                    value: groupName,
                    label: groupName.split('_').map(word =>
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')
                  }))
                ]}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                className="flex-1"
                disabled={searchLoading}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={searchLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {searchLoading ? (
          <div className="flex items-center justify-center py-8">
            <PageLoading />
          </div>
        ) : partnersData ? (
          <>
            <PartnersTable
              data={partnersData.data}
              onSort={handleTableSort}
              onEdit={handleEditPartner}
              onDelete={handlePartnerDeleted}
              loading={searchLoading}
            />

            {/* Pagination */}
            {partnersData.pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination2
                  pagination={{
                    ...partnersData.pagination,
                    hasNext: partnersData.pagination.page < partnersData.pagination.totalPages,
                    hasPrev: partnersData.pagination.page > 1,
                    links: {
                      next: partnersData.pagination.page < partnersData.pagination.totalPages
                        ? `/api/partners?page=${partnersData.pagination.page + 1}&limit=${partnersData.pagination.limit}`
                        : null,
                      prev: partnersData.pagination.page > 1
                        ? `/api/partners?page=${partnersData.pagination.page - 1}&limit=${partnersData.pagination.limit}`
                        : null,
                      first: `/api/partners?page=1&limit=${partnersData.pagination.limit}`,
                      last: `/api/partners?page=${partnersData.pagination.totalPages}&limit=${partnersData.pagination.limit}`,
                    }
                  }}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No partners found.</p>
          </div>
        )}
      </div>


    </div>
  );
}

export default function PartnersPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PartnersContent />
    </Suspense>
  );
}