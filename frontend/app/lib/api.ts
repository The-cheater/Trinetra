// Central API service with JWT handling
export interface ApiResponse<T = any> {
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
  private defaultHeaders: HeadersInit

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  // Get stored auth token
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  // Set auth token
  setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  // Remove auth token
  removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_id')
      localStorage.removeItem('user_name')
    }
  }

  // Get headers with auth token
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers = { ...this.defaultHeaders }
    
    if (includeAuth) {
      const token = this.getAuthToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }
    
    return headers
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(includeAuth),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error)
      throw error
    }
  }

  // GET request
  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, includeAuth)
  }

  // POST request
  async post<T>(
    endpoint: string, 
    data?: any, 
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const body = data instanceof FormData ? data : JSON.stringify(data)
    const headers = data instanceof FormData ? {} : { 'Content-Type': 'application/json' }
    
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body,
        headers,
      },
      includeAuth
    )
  }

  // PUT request
  async put<T>(
    endpoint: string, 
    data?: any, 
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      includeAuth
    )
  }

  // DELETE request
  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, includeAuth)
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<AuthTokens>> {
    const response = await this.post<AuthTokens>('/api/auth/login', { email, password }, false)
    
    if (response.success && response.data) {
      this.setAuthToken(response.data.token)
      localStorage.setItem('user_id', response.data.user.userId)
      localStorage.setItem('user_name', response.data.user.name)
    }
    
    return response
  }

  async register(name: string, email: string, password: string): Promise<ApiResponse<AuthTokens>> {
    const response = await this.post<AuthTokens>('/api/auth/register', { name, email, password }, false)
    
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
