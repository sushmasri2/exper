'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PartnersForm } from '@/app/dashboard/partners/components/PartnersForm';
import { getPartnerGroups } from '@/lib/partners-api';
import { useApiCache } from '@/hooks/use-api-cache';
import { showToast } from '@/lib/toast';

interface EditPartnerPageProps {
  params: Promise<{
    uuid: string;
  }>;
}

export default function EditPartnerPage({ params }: EditPartnerPageProps) {
  const router = useRouter();
  const [partnerGroups, setPartnerGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerUuid, setPartnerUuid] = useState<string>('');
  const { invalidateRelatedCache } = useApiCache();

  // Resolve the async params
  useEffect(() => {
    params.then(resolvedParams => {
      setPartnerUuid(resolvedParams.uuid);
    });
  }, [params]);

  useEffect(() => {
    loadPartnerGroups();
  }, []);

  const loadPartnerGroups = async () => {
    try {
      const response = await getPartnerGroups();
      setPartnerGroups(response.data);
    } catch (error) {
      console.error('Error loading partner groups:', error);
      showToast('Failed to load partner groups', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerSaved = async () => {
    // Invalidate cache and redirect to partners list
    invalidateRelatedCache('partners');
    router.push('/dashboard/partners');
  };

  const handleCancel = () => {
    router.push('/dashboard/partners');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-foreground">Loading partner groups...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Edit Partner</h1>
        <p className="text-muted-foreground mt-2">Update partner information</p>
      </div>

      <div className="bg-card rounded-lg shadow-sm border p-6">
        {partnerUuid && (
          <PartnersForm
            partnerUuid={partnerUuid}
            groups={partnerGroups}
            onSave={handlePartnerSaved}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}