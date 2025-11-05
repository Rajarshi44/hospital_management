const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export class ApiClient {
  private static getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (includeAuth && typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken")
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    }

    return headers
  }

  static async request<T>(endpoint: string, options: RequestInit = {}, includeAuth = true): Promise<T> {
    // Ensure proper URL construction - remove trailing slash from base URL and ensure endpoint has leading slash
    const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    const url = `${baseUrl}${cleanEndpoint}`
    const headers = this.getHeaders(includeAuth)

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: response.statusText,
        }))
        throw new Error(error.message || "An error occurred")
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Network error occurred")
    }
  }

  static async get<T>(endpoint: string, includeAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" }, includeAuth)
  }

  static async post<T>(endpoint: string, data: any, includeAuth = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      includeAuth
    )
  }

  static async put<T>(endpoint: string, data: any, includeAuth = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      includeAuth
    )
  }

  static async patch<T>(endpoint: string, data: any, includeAuth = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      includeAuth
    )
  }

  static async delete<T>(endpoint: string, includeAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" }, includeAuth)
  }
}
