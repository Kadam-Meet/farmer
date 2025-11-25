const API_BASE_URL = "/api/v1";

export class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const isFormData = options.body instanceof FormData;

    const config: RequestInit = {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
      },
    };

    const res = await fetch(url, config);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP error: ${res.status}`);
    }

    if (res.status === 204) return {} as T;
    return res.json();
  }

  // ------------ LISTINGS -------------
  async getListings(params: Record<string, any> = {}): Promise<any[]> {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) q.append(k, String(v));
    });
    return this.request(`/listings/?${q.toString()}`, { method: "GET" });
  }

  async getListingById(id: string) {
    return this.request(`/listings/${id}`, { method: "GET" });
  }

  async createListing(data: FormData) {
    return this.request(`/listings/`, { method: "POST", body: data });
  }

  // ------------ BOOKINGS -------------
  async getBookings(params: Record<string, any> = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) q.append(k, String(v));
    });
    return this.request(`/bookings/?${q.toString()}`, { method: "GET" });
  }

  async updateBookingStatus(id: string, status: string) {
    return this.request(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }
}

export const apiClient = new APIClient();
