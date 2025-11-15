// Central API service with JWT handling
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface AuthTokens {
  token: string
  user: {
    userId: string
    name: string
    email: string
  }
}

class ApiService {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private retryAttempts: number
  private readonly maxRetries: number

  constructor() {
    // Ensure the API URL is properly set
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://trinetra-3.onrender.com';
    this.baseURL = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    this.retryAttempts = 0;
    this.maxRetries = 3;
    
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    if (process.env.NODE_ENV === 'development') {
      console.log(`API Service initialized with base URL: ${this.baseURL}`);
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      const error = data?.message || `HTTP error! status: ${response.status}`;
      if (process.env.NODE_ENV !== 'production') {
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          error: data
        });
      }
      throw new Error(error);
    }
    
    return data as ApiResponse<T>;
  }

  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit,
    retries = this.maxRetries
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, options);
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (retries > 0) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Retrying request (${this.maxRetries - retries + 1}/${this.maxRetries}):`, error);
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * (this.maxRetries - retries + 1)));
        return this.fetchWithRetry<T>(url, options, retries - 1);
      }
      throw error;
    }
  }

  // Get stored auth token with better error handling
  private getAuthToken(): string | null {
    try {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  }

  // Set auth token with validation
  public setAuthToken(token: string): void {
    try {
      if (typeof window !== 'undefined' && token) {
        localStorage.setItem('auth_token', token);
      }
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  // Remove auth token with error handling
  public removeAuthToken(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_name');
      }
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  // Enhanced request method with retry logic and FormData support
  private async request<T>(
    endpoint: string,
    method: string = 'GET',
    data: unknown = null,
    customHeaders: Record<string, string> = {}
  ): Promise<ApiResponse<T>> {
    // Remove any leading slashes from endpoint to prevent double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    const url = `${this.baseURL}/${cleanEndpoint}`;
    const token = this.getAuthToken();
    
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...customHeaders
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
      credentials: 'include' as RequestCredentials,
      mode: 'cors'
    };

    if (data) {
      if (data instanceof FormData) {
        // Remove content-type header for FormData to let the browser set it with boundary
        delete headers['Content-Type'];
        options.body = data;
      } else {
        options.body = JSON.stringify(data);
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${method} ${url}`, { data, headers });
    }

    try {
      return await this.fetchWithRetry<T>(url, options);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          // Handle unauthorized errors (e.g., token expired)
          this.removeAuthToken();
          window.location.href = '/login';
        }
        throw new Error(`API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  // Get headers with auth token
  private getHeaders(includeAuth: boolean = true): Record<string, string> {
    const headers: Record<string, string> = { ...this.defaultHeaders }
    
    if (includeAuth) {
      const token = this.getAuthToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }
    
    return headers
  }

  // GET request
  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', null, includeAuth ? {} : { 'Authorization': '' })
  }

  // POST request
  async post<T>(
    endpoint: string, 
    data?: unknown, 
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {}
    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }
    
    return this.request<T>(
      endpoint,
      'POST',
      data,
      includeAuth ? headers : { ...headers, 'Authorization': '' }
    )
  }

  // PUT request
  async put<T>(
    endpoint: string, 
    data?: unknown, 
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      'PUT',
      data,
      includeAuth ? {} : { 'Authorization': '' }
    )
  }

  // DELETE request
  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', null, includeAuth ? {} : { 'Authorization': '' })
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<AuthTokens>> {
    const response = await this.post<AuthTokens>('/auth/login', { email, password }, false)
    
    if (response.success && response.data) {
      this.setAuthToken(response.data.token)
      localStorage.setItem('user_id', response.data.user.userId)
      localStorage.setItem('user_name', response.data.user.name)
    }
    
    return response
  }

  async register(name: string, email: string, password: string): Promise<ApiResponse<AuthTokens>> {
    const response = await this.post<AuthTokens>('/auth/register', { name, email, password }, false)
    
    if (response.success && response.data) {
      this.setAuthToken(response.data.token)
      localStorage.setItem('user_id', response.data.user.userId)
      localStorage.setItem('user_name', response.data.user.name)
    }
    
    return response
  }

  async logout(): Promise<void> {
    this.removeAuthToken()
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }

  // Get current user info from localStorage
  getCurrentUser(): { userId: string; name: string } | null {
    if (typeof window === 'undefined') return null
    
    const userId = localStorage.getItem('user_id')
    const name = localStorage.getItem('user_name')
    
    if (userId && name) {
      return { userId, name }
    }
    
    return null
  }
}

// Export singleton instance
export const apiService = new ApiService()

// Export individual methods for convenience
export const {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  login: apiLogin,
  register: apiRegister,
  logout: apiLogout,
  isAuthenticated,
  getCurrentUser,
  setAuthToken,
  removeAuthToken
} = apiService
