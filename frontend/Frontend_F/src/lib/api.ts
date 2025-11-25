import type { ListingType } from "@/types/listing";

/**
 * API client for FastAPI backend
 */
const API_BASE_URL = '/api/v1';

export type ListingPeriod = 'hour' | 'day' | 'week' | 'month';
export type EquipmentCondition = 'excellent' | 'good' | 'fair';

export interface ListingResponse {
  id: string;
  owner_id: string;
  type: ListingType;
  title: string;
  description?: string;
  category: string;
  brand?: string;
  period: ListingPeriod;
  price_per_hour?: number;
  price_per_day?: number;
  price_per_week?: number;
  price_per_month?: number;
  location: string;
  pincode?: string;
  city?: string;
  state?: string;
  condition?: EquipmentCondition;
  area?: number;
  available: boolean;
  rating: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
  owner?: {
    id: string;
    full_name?: string;
    phone?: string;
    city?: string;
    state?: string;
  };
}

export interface ListingQueryParams {
  q?: string;
  type?: ListingType;
  category?: string;
  brand?: string;
  condition?: EquipmentCondition;
  price_min_day?: number;
  price_max_day?: number;
  price_min_week?: number;
  price_max_week?: number;
  price_min_month?: number;
  price_max_month?: number;
  location?: string;
  pincode?: string;
  available?: boolean;
  user_lat?: number;
  user_long?: number;
  distance_km?: number;
  limit?: number;
  offset?: number;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  user_id?: string;
  language?: string;
}

export interface ChatResponse {
  conversation_id: string;
  message: string;
  role: string;
  created_at: string;
}

export interface WeatherRequest {
  location?: string;
  language?: string;
}

export interface WeatherAlert {
  id?: string;
  location: string;
  severity: string;
  message_en: string;
  message_hi?: string;
  message_gu?: string;
  alert_type?: string;
  icon?: string;
  temperature?: number;
  humidity?: number;
  wind_speed?: number;
  rainfall?: number;
}

export interface Scheme {
  id: string;
  name: string;
  description: string;
  application_url?: string;
  category?: string;
  is_active: boolean;
}

export interface Tip {
  id: string;
  title: string;
  description: string;
  content: string;
  category?: string;
  icon?: string;
  is_active: boolean;
  season?: string;
}

export interface MandiPrice {
  id: string;
  market: string;
  commodity: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  date: string;
}

export interface CurrentWeather {
  location: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
}

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface BookingResponse {
  id: string;
  listing_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  listing: ListingResponse;
}

export interface BookingCreate {
  listing_id: string;
  start_date: string;
  end_date: string;
  total_price?: number;
}

export interface BookingFilter {
  role?: 'all' | 'owner' | 'renter';
  status?: BookingStatus;
  limit?: number;
  offset?: number;
}

export interface BookingStatusUpdate {
  status: BookingStatus;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      if (!supabase) return null;
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // If endpoint starts with /api, use it as absolute path (for listings/bookings backend)
    // Otherwise, prepend baseURL (for v1 API endpoints)
    const url = endpoint.startsWith('/api') ? endpoint : `${this.baseURL}${endpoint}`;
    const isFormData = options.body instanceof FormData;
    const authToken = await this.getAuthToken();
    
    const headers: HeadersInit = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Chat endpoints
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>('/chat/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Weather endpoints
  async getWeatherAlerts(request: WeatherRequest): Promise<WeatherAlert[]> {
    return this.request<WeatherAlert[]>('/weather/alerts', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getCurrentWeather(location: string = "Delhi,IN"): Promise<CurrentWeather> {
    return this.request<CurrentWeather>(
      `/weather/current?location=${encodeURIComponent(location)}`,
      { method: 'GET' }
    );
  }

  // Schemes endpoints
  async getSchemes(language: string = 'en', activeOnly: boolean = true): Promise<Scheme[]> {
    return this.request<Scheme[]>(
      `/schemes/?language=${language}&active_only=${activeOnly}`,
      { method: 'GET' }
    );
  }

  // Tips endpoints
  async getTips(
    language: string = 'en',
    category?: string,
    season?: string,
    activeOnly: boolean = true
  ): Promise<Tip[]> {
    let url = `/tips/?language=${language}&active_only=${activeOnly}`;
    if (category) url += `&category=${category}`;
    if (season && season !== 'all') url += `&season=${season}`;
    return this.request<Tip[]>(url, { method: 'GET' });
  }

  // Mandi endpoints
  async getMandiPrices(commodity: string): Promise<MandiPrice[]> {
    return this.request<MandiPrice[]>(
      `/mandi/?commodity=${encodeURIComponent(commodity)}`,
      { method: 'GET' }
    );
  }

  async refreshMandiPrices(commodity: string): Promise<MandiPrice[]> {
    return this.request<MandiPrice[]>(
      `/mandi/refresh?commodity=${encodeURIComponent(commodity)}`,
      { method: 'POST' }
    );
  }

  // Health check
  async healthCheck() {
    return this.request('/health', { method: 'GET' });
  }

  // Listing endpoints (using /api prefix directly, not /api/v1)
  async getListings(params: ListingQueryParams = {}): Promise<ListingResponse[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      searchParams.append(key, String(value));
    });

    const query = searchParams.toString();
    const endpoint = query ? `/api/listings/?${query}` : '/api/listings/';
    return this.request<ListingResponse[]>(endpoint, { method: 'GET' });
  }

  async getListingById(listingId: string): Promise<ListingResponse> {
    return this.request<ListingResponse>(`/api/listings/${listingId}`, { method: 'GET' });
  }

  async createListing(formData: FormData): Promise<ListingResponse> {
    return this.request<ListingResponse>('/api/listings/', {
      method: 'POST',
      body: formData,
    });
  }

  // Booking endpoints (using /api prefix directly, not /api/v1)
  async getBookings(filters: BookingFilter = {}): Promise<BookingResponse[]> {
    const searchParams = new URLSearchParams();
    if (filters.role && filters.role !== 'all') {
      searchParams.append('role', filters.role);
    }
    if (filters.status) {
      searchParams.append('status', filters.status);
    }
    if (filters.limit) {
      searchParams.append('limit', String(filters.limit));
    }
    if (filters.offset) {
      searchParams.append('offset', String(filters.offset));
    }

    const query = searchParams.toString();
    const endpoint = query ? `/api/bookings/?${query}` : '/api/bookings/';
    return this.request<BookingResponse[]>(endpoint, { method: 'GET' });
  }

  async createBooking(booking: BookingCreate): Promise<BookingResponse> {
    return this.request<BookingResponse>('/api/bookings/', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<BookingResponse> {
    return this.request<BookingResponse>(`/api/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

export const apiClient = new APIClient();
