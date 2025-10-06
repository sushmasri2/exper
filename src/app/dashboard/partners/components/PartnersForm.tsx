'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Select2 from '@/components/ui/Select2';
import { Modal } from '@/components/ui/modal';
import { createPartner, updatePartner, getPartner } from '@/lib/partners-api';
import { showToast } from '@/lib/toast';
import type { CreatePartnerData, UpdatePartnerData } from '@/types/partners';

interface PartnersFormProps {
  partnerUuid?: string; // For edit mode
  groups: string[];
  onSave: () => void;
  onCancel: () => void;
}

export function PartnersForm({ partnerUuid, groups, onSave, onCancel }: PartnersFormProps) {
  const [formData, setFormData] = useState<CreatePartnerData>({
    name: '',
    description: '',
    image_url: '',
    web_url: '',
    group_name: '',
    position: 0,
  });
  const [initialLoading, setInitialLoading] = useState(!!partnerUuid);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<string[]>(groups);

  const loadPartnerData = useCallback(async () => {
    if (!partnerUuid) return;

    try {
      setInitialLoading(true);
      const response = await getPartner(partnerUuid);
      const partner = response.data;

      setFormData({
        name: partner.name,
        description: partner.description || '',
        image_url: partner.image_url || '',
        web_url: partner.web_url || '',
        group_name: partner.group_name,
        position: partner.position || 0,
      });
    } catch (error) {
      console.error('Error loading partner:', error);
      showToast('Failed to load partner data', 'error');
    } finally {
      setInitialLoading(false);
    }
  }, [partnerUuid]);

  // Load existing partner data if editing
  useEffect(() => {
    if (partnerUuid) {
      loadPartnerData();
    }
  }, [partnerUuid, loadPartnerData]);

  // Update available groups when props change
  useEffect(() => {
    setAvailableGroups(groups);
  }, [groups]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Partner name is required', 'error');
      return;
    }

    if (!formData.group_name) {
      showToast('Partner group is required', 'error');
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    try {
      setIsConfirming(true);

      if (partnerUuid) {
        // Update existing partner
        const updateData: UpdatePartnerData = {
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          image_url: formData.image_url?.trim() || undefined,
          web_url: formData.web_url?.trim() || undefined,
          group_name: formData.group_name,
          position: formData.position,
        };

        await updatePartner(partnerUuid, updateData);
        showToast('Partner updated successfully', 'success');
      } else {
        // Create new partner
        const createData: CreatePartnerData = {
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          image_url: formData.image_url?.trim() || undefined,
          web_url: formData.web_url?.trim() || undefined,
          group_name: formData.group_name,
          position: formData.position,
        };

        await createPartner(createData);
        showToast('Partner created successfully', 'success');
      }

      setShowConfirmModal(false);
      onSave();
    } catch (error) {
      console.error('Error saving partner:', error);
      showToast(
        partnerUuid ? 'Failed to update partner' : 'Failed to create partner',
        'error'
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const handleInputChange = (field: keyof CreatePartnerData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatDisplayName = (groupName: string): string => {
    return groupName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleCreateGroup = (newGroupName: string) => {
    const trimmedName = newGroupName.trim();
    if (!trimmedName) return;

    // Check for duplicates (exact match since formatting is already done)
    const existingGroup = availableGroups.find(
      group => group === trimmedName
    );

    if (!existingGroup) {
      setAvailableGroups(prev => [...prev, trimmedName]);
      showToast(`Group "${formatDisplayName(trimmedName)}" added successfully`, 'success');
    } else {
      showToast(`Group "${formatDisplayName(existingGroup)}" already exists`, 'warning');
    }
  };

  const groupOptions = availableGroups.map(group => ({
    value: group,
    label: formatDisplayName(group),
  }));

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-foreground">Loading partner data...</div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Partner Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">Partner Name *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter partner name"
            required
          />
        </div>

        {/* Group */}
        <div className="space-y-2">
          <Label htmlFor="group_name" className="text-foreground">Group *</Label>
          <Select2
            options={groupOptions}
            value={formData.group_name}
            onChange={(value) => handleInputChange('group_name', value as string)}
            placeholder="Select a group"
            allowCreate={true}
            onCreateOption={handleCreateGroup}
          />
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <Label htmlFor="image_url" className="text-foreground">Image URL</Label>
          <Input
            id="image_url"
            type="url"
            value={formData.image_url}
            onChange={(e) => handleInputChange('image_url', e.target.value)}
            placeholder="https://example.com/logo.png"
          />
        </div>

        {/* Website URL */}
        <div className="space-y-2">
          <Label htmlFor="web_url" className="text-foreground">Website URL</Label>
          <Input
            id="web_url"
            type="url"
            value={formData.web_url}
            onChange={(e) => handleInputChange('web_url', e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        {/* Position */}
        <div className="space-y-2">
          <Label htmlFor="position" className="text-foreground">Position</Label>
          <Input
            id="position"
            type="number"
            min="0"
            value={formData.position}
            onChange={(e) => handleInputChange('position', parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter partner description"
          rows={4}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="destructive" onClick={onCancel} disabled={isConfirming}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primaryBtn"
          disabled={isConfirming}
        >
          {isConfirming ? 'Processing...' : partnerUuid ? 'Update Partner' : 'Create Partner'}
        </Button>
      </div>
    </form>

    {/* Confirmation Modal */}
    <Modal
      open={showConfirmModal}
      onOpenChange={setShowConfirmModal}
      type="confirmation"
      variant="info"
      title={partnerUuid ? "Update Partner" : "Create Partner"}
      message={partnerUuid
        ? `Are you sure you want to update the partner "${formData.name}"? This will modify the existing partner information.`
        : `Are you sure you want to create a new partner "${formData.name}"? This will add a new partner to the system.`
      }
      onConfirm={handleConfirmSave}
      confirmText={partnerUuid ? "Update Partner" : "Create Partner"}
      cancelText="Cancel"
      loading={isConfirming}
      confirmButtonVariant="primaryBtn"
    />
    </>
  );
}