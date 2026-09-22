let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export const fetchApi = async (endpoint: string, options: FetchOptions = {}) => {
  const { requireAuth = true, headers, ...restOptions } = options;
  
  let currentHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (requireAuth && accessToken) {
    currentHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const crossOriginOptions: RequestInit = {
    ...restOptions,
    headers: currentHeaders,
    credentials: 'include',
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, crossOriginOptions);

  if (response.status === 401 && requireAuth) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setAccessToken(refreshData.data.access_token);
        
        currentHeaders['Authorization'] = `Bearer ${accessToken}`;
        const retryOptions: RequestInit = {
          ...restOptions,
          headers: currentHeaders,
          credentials: 'include',
        };
        response = await fetch(`${API_BASE_URL}${endpoint}`, retryOptions);
      } else {
        setAccessToken(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      setAccessToken(null);
    }
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  let data;
  try {
    data = isJson ? await response.json() : await response.text();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(isJson ? (data?.message || data?.error?.message || 'API Error') : 'API Error');
  }

  return data;
};
