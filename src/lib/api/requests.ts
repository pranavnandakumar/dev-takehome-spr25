import { Request } from "@/components/tables/RequestsTable";

export interface RequestsResponse {
  data: Request[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateRequestData {
  requestorName: string;
  itemRequested: string;
}

export interface UpdateRequestData {
  id: string;
  status: "pending" | "completed" | "approved" | "rejected";
}

export interface BatchUpdateData {
  ids: string[];
  status: "pending" | "completed" | "approved" | "rejected";
}

export interface BatchDeleteData {
  ids: string[];
}

export interface BatchUpdateResponse {
  message: string;
  updatedCount: number;
  matchedCount: number;
  data: Request[];
}

export interface BatchDeleteResponse {
  message: string;
  deletedCount: number;
}

class RequestsAPI {
  private baseURL = "/api/request";

  async getRequests(page: number = 1, status?: string): Promise<RequestsResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    if (status) {
      params.append("status", status);
    }

    const response = await fetch(`${this.baseURL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch requests: ${response.statusText}`);
    }

    return response.json();
  }

  async createRequest(data: CreateRequestData): Promise<Request> {
    const response = await fetch(this.baseURL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create request: ${response.statusText}`);
    }

    return response.json();
  }

  async updateRequestStatus(data: UpdateRequestData): Promise<Request> {
    const response = await fetch(this.baseURL, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update request: ${response.statusText}`);
    }

    return response.json();
  }

  async batchUpdateStatus(data: BatchUpdateData): Promise<BatchUpdateResponse> {
    const response = await fetch(`${this.baseURL}/batch`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to batch update requests: ${response.statusText}`);
    }

    return response.json();
  }

  async batchDelete(data: BatchDeleteData): Promise<BatchDeleteResponse> {
    const response = await fetch(`${this.baseURL}/batch`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to batch delete requests: ${response.statusText}`);
    }

    return response.json();
  }
}

export const requestsAPI = new RequestsAPI();
