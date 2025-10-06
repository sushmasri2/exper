"use client";

import { Partner } from "@/types/partners";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import Table from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { deletePartner } from "@/lib/partners-api";
import { useState } from "react";
import { showToast } from "@/lib/toast";

interface PartnersTableProps {
  data: Partner[];
  onSort: (accessor: string, direction: 'asc' | 'desc') => void;
  onEdit: (uuid: string) => void;
  onDelete?: () => void;
  loading?: boolean;
}

export function PartnersTable({
  data,
  onSort,
  onEdit,
  onDelete,
  loading = false
}: PartnersTableProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = (partner: Partner) => {
    setPartnerToDelete(partner);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPartnerToDelete(null);
  };

  const handleEdit = (partner: Partner) => {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onEdit(partner.uuid);
    };
  };

  const handleWebsite = (partner: Partner) => {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (partner.web_url) {
        event.stopPropagation();
        const url = partner.web_url.startsWith('http') ? partner.web_url : `https://${partner.web_url}`;
        window.open(url, '_blank');
      }
    };
  };

  const handleDelete = async () => {
    if (!partnerToDelete) return;

    setIsDeleting(true);
    try {
      await deletePartner(partnerToDelete.uuid);
      showToast(`Partner "${partnerToDelete.name}" has been deleted successfully.`, "success");
      closeDeleteModal();
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Failed to delete partner:', error);
      showToast(`Failed to delete partner. Please try again.`, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Format group name from snake_case to Title Case
  const formatGroupName = (groupName?: string) => {
    if (!groupName) return "Uncategorized";
    return groupName.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className="space-y-4">
        <Table
          columns={[
            {
              header: "Partner",
              accessor: "name",
              sortable: true,
              render: (value, row) => {
                const partner = row as unknown as Partner;
                return (
                  <div className="flex items-center gap-3">
                    {partner.image_url && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        <img
                          src={partner.image_url}
                          alt={`${partner.name} logo`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {partner.name}
                      </div>
                      {partner.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[300px]">
                          {partner.description}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            },
            {
              header: "Group",
              accessor: "group_name",
              sortable: true,
              render: (value) => {
                return (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {formatGroupName(value as string)}
                  </span>
                );
              }
            },
            {
              header: "Website",
              accessor: "web_url",
              sortable: false,
              render: (value, row) => {
                const partner = row as unknown as Partner;
                return (
                  <div className="flex items-center gap-2">
                    {partner.web_url ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleWebsite(partner)}
                          className="p-1 h-8 w-8"
                          title={`Visit ${partner.web_url}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                          {partner.web_url}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                    )}
                  </div>
                );
              }
            },
            {
              header: "Position",
              accessor: "position",
              sortable: true,
              render: (value) => {
                return (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {(value as number) || '—'}
                  </span>
                );
              }
            },
            {
              header: "Created",
              accessor: "created_at",
              sortable: true,
              render: (value) => (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(value as string)}
                </span>
              )
            },
            {
              header: "Actions",
              accessor: "actions",
              sortable: false,
              render: (_, row) => {
                const partner = row as unknown as Partner;
                return (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEdit(partner)}
                      className="p-1 h-8 w-8"
                      title="Edit partner"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteModal(partner)}
                      className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete partner"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              }
            }
          ]}
          data={data as unknown as Record<string, unknown>[]}
          onSort={onSort}
          loading={loading}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete Partner"
        description="Confirm deletion of the selected partner"
        showCloseButton={false}
      >
        <div className="p-2">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete <strong>{partnerToDelete?.name}</strong>?
            This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={closeDeleteModal}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}