import React, { useState } from "react";
import Button from "../atoms/Button";
import Dropdown, { DropdownOption } from "../atoms/Dropdown";
import { Request } from "../tables/RequestsTable";

interface BatchOperationsProps {
  requests: Request[];
  onBatchUpdate: (ids: string[], status: string) => Promise<void>;
  onBatchDelete: (ids: string[]) => Promise<void>;
  loading?: boolean;
  selectedIds: string[];
  onSelectAll: () => void;
}

const statusOptions: DropdownOption[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

export default function BatchOperations({ 
  requests, 
  onBatchUpdate, 
  onBatchDelete, 
  loading = false,
  selectedIds,
  onSelectAll
}: BatchOperationsProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
  const [batchLoading, setBatchLoading] = useState(false);

  const handleBatchUpdate = async () => {
    if (selectedIds.length === 0) return;
    
    setBatchLoading(true);
    try {
      await onBatchUpdate(selectedIds, selectedStatus);
    } catch (error) {
      console.error("Batch update failed:", error);
    } finally {
      setBatchLoading(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} request(s)?`)) {
      return;
    }
    
    setBatchLoading(true);
    try {
      await onBatchDelete(selectedIds);
    } catch (error) {
      console.error("Batch delete failed:", error);
    } finally {
      setBatchLoading(false);
    }
  };

  if (requests.length === 0) return null;

  return (
    <div className="bg-white border border-gray-stroke rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Selection Controls */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedIds.length === requests.length && requests.length > 0}
              onChange={onSelectAll}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">
              Select All ({selectedIds.length} selected)
            </span>
          </label>
        </div>

        {/* Batch Operations */}
        {selectedIds.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Update to:</span>
              <Dropdown
                options={statusOptions}
                value={selectedStatus}
                onChange={setSelectedStatus}
                className="w-32"
              />
            </div>
            <Button
              onClick={handleBatchUpdate}
              disabled={batchLoading || loading}
              className="px-4 py-2 text-sm"
            >
              {batchLoading ? "Updating..." : `Update ${selectedIds.length}`}
            </Button>
            <Button
              onClick={handleBatchDelete}
              disabled={batchLoading || loading}
              variant="inverted"
              className="px-4 py-2 text-sm"
            >
              {batchLoading ? "Deleting..." : `Delete ${selectedIds.length}`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
