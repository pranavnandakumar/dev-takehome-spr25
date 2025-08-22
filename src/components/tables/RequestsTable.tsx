import React from "react";
import Dropdown, { DropdownOption } from "../atoms/Dropdown";

export interface Request {
  _id: string;
  requestorName: string;
  itemRequested: string;
  createdDate: string;
  lastEditedDate?: string;
  status: "pending" | "completed" | "approved" | "rejected";
}

interface RequestsTableProps {
  requests: Request[];
  onStatusChange: (id: string, status: string) => void;
  loading?: boolean;
  selectedIds?: string[];
  onSelectRequest?: (id: string) => void;
}

const statusOptions: DropdownOption[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function RequestsTable({ 
  requests, 
  onStatusChange, 
  loading = false,
  selectedIds = [],
  onSelectRequest
}: RequestsTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No requests found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-stroke rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {onSelectRequest && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Select
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Requestor Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Item Requested
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Edited
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-stroke">
          {requests.map((request) => (
            <tr key={request._id} className="hover:bg-gray-50">
              {onSelectRequest && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(request._id)}
                    onChange={() => onSelectRequest(request._id)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {request.requestorName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {request.itemRequested}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(request.createdDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {request.lastEditedDate ? formatDate(request.lastEditedDate) : formatDate(request.createdDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Dropdown
                  options={statusOptions}
                  value={request.status}
                  onChange={(newStatus) => onStatusChange(request._id, newStatus)}
                  className="w-32"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
