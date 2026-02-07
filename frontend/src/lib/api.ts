import { Task } from "@/types/task";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ||
(typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? "http://localhost:8000"
  : "https://todo-web-app-i8sh.onrender.com");

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    // Try multiple possible token storage locations
    return localStorage.getItem("access_token") || localStorage.getItem("token");
  }
  return null;
};

// Generic API request function
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`Making API request to: ${url}`);

  // Check if we're sending FormData to avoid overriding Content-Type
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }), // Don't set Content-Type for FormData
    ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // Required for cookies/tokens with allow_credentials=True
    });

    console.log(`API response status: ${response.status}`);

    // Handle 401 Unauthorized - automatically logout user
    if (response.status === 401) {
      console.error('401 Unauthorized - clearing session and redirecting to login');

      // Clear all auth state
      if (typeof window !== 'undefined') {
        localStorage.clear();

        // Clear all cookies
        document.cookie.split(";").forEach(function(c) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      }

      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      }
      throw new Error('Session expired - please login again');
    }

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `API request failed: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`Fetch error for ${url}:`, error);

    // Provide more specific error messages
  
if (error.name === 'TypeError' && error.message.includes('fetch')) {
  throw new Error(`Network error: Unable to connect to the server at ${API_BASE_URL}. Please check if the backend is live.`);
}

    throw error;
  }
};

// Authentication API functions
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiRequest("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
  },

  signup: async (email: string, password: string, name: string) => {
    console.log("DEBUG: Sending signup request with data:", { email, password: password.length > 0 ? "[PROTECTED]" : "", name });
    return apiRequest("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    });
  },

  logout: async () => {
    return apiRequest("/api/auth/logout", {
      method: "POST",
    });
  },
};

// Task API functions
export const taskAPI = {
  getAll: async (): Promise<Task[]> => {
    return apiRequest("/api/tasks");
  },

  getById: async (id: string): Promise<Task> => {
    return apiRequest(`/api/tasks/${id}`);
  },

  create: async (taskData: Omit<Task, "id" | "created_at" | "updated_at">): Promise<Task> => {
    return apiRequest("/api/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  },

  update: async (id: string, taskData: Partial<Task>): Promise<Task> => {
    return apiRequest(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest(`/api/tasks/${id}`, {
      method: "DELETE",
    });
  },

  toggleComplete: async (id: string): Promise<Task> => {
    return apiRequest(`/api/tasks/${id}/toggle-complete`, {
      method: "PATCH",
    });
  },

  search: async (query: string): Promise<Task[]> => {
    return apiRequest(`/api/tasks/search?q=${encodeURIComponent(query)}`);
  },
};

export default apiRequest;