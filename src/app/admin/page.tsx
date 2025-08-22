"use client";

import React, { useState, useEffect } from "react";
import RequestsTable, { Request } from "@/components/tables/RequestsTable";
import Pagination from "@/components/molecules/Pagination";
import BatchOperations from "@/components/molecules/BatchOperations";
import { requestsAPI, RequestsResponse } from "@/lib/api/requests";

type StatusFilter = "all" | "pending" | "completed" | "approved" | "rejected";

const statusTabs = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
] as const;

export default function AdminPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentStatus, setCurrentStatus] = useState<StatusFilter>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchRequests = async (page: number, status: StatusFilter) => {
    try {
      setLoading(true);
      setError(null);
      
      const statusParam = status === "all" ? undefined : status;
      const response: RequestsResponse = await requestsAPI.getRequests(page, statusParam);
      
      setRequests(response.data);
      setPaginationData({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch requests");
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(currentPage, currentStatus);
  }, [currentPage, currentStatus]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const updatedRequest = await requestsAPI.updateRequestStatus({
        id,
        status: newStatus as "pending" | "completed" | "approved" | "rejected",
      });

      // Update the request in the local state
      setRequests(prevRequests =>
        prevRequests.map(request =>
          request._id === id ? updatedRequest : request
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update request status");
      console.error("Error updating request status:", err);
    }
  };

  const handleBatchUpdate = async (ids: string[], status: string) => {
    try {
      const result = await requestsAPI.batchUpdateStatus({
        ids,
        status: status as "pending" | "completed" | "approved" | "rejected",
      });

      // Update the requests in the local state
      setRequests(prevRequests =>
        prevRequests.map(request =>
          ids.includes(request._id) 
            ? { ...request, status: status as "pending" | "completed" | "approved" | "rejected", lastEditedDate: new Date().toISOString() }
            : request
        )
      );

      // Clear selection after successful update
      setSelectedIds([]);

      // Show success message
      setError(null);
      console.log(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to batch update requests");
      console.error("Error batch updating requests:", err);
    }
  };

  const handleBatchDelete = async (ids: string[]) => {
    try {
      const result = await requestsAPI.batchDelete({ ids });

      // Remove the deleted requests from the local state
      setRequests(prevRequests =>
        prevRequests.filter(request => !ids.includes(request._id))
      );

      // Clear selection after successful delete
      setSelectedIds([]);

      // Show success message
      setError(null);
      console.log(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to batch delete requests");
      console.error("Error batch deleting requests:", err);
    }
  };

  const handleSelectRequest = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === requests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(requests.map(req => req._id));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedIds([]); // Clear selection when changing pages
  };

  const handleStatusTabChange = (status: StatusFilter) => {
    setCurrentStatus(status);
    setCurrentPage(1); // Reset to first page when changing status filter
    setSelectedIds([]); // Clear selection when changing tabs
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Crisis Corner Admin Portal</h1>
          <p className="mt-2 text-gray-600">Manage item requests and their status</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Status Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleStatusTabChange(tab.value as StatusFilter)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    currentStatus === tab.value
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Batch Operations */}
        <BatchOperations
          requests={requests}
          onBatchUpdate={handleBatchUpdate}
          onBatchDelete={handleBatchDelete}
          loading={loading}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
        />

        {/* Table */}
        <div className="bg-white shadow rounded-lg">
          <RequestsTable
            requests={requests}
            onStatusChange={handleStatusChange}
            loading={loading}
            selectedIds={selectedIds}
            onSelectRequest={handleSelectRequest}
          />
        </div>

        {/* Pagination */}
        {!loading && requests.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              pageNumber={paginationData.page}
              pageSize={paginationData.limit}
              totalRecords={paginationData.total}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && requests.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {currentStatus === "all" 
                ? "Get started by creating a new request." 
                : `No ${currentStatus} requests found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
