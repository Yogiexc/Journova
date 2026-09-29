let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

let refreshTokenPromise: Promise<string | null> | null = null;

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
      if (!refreshTokenPromise) {
        refreshTokenPromise = fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }).then(async (refreshResponse) => {
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            const newAccessToken = refreshData.data.access_token;
            setAccessToken(newAccessToken);
            return newAccessToken;
          } else {
            setAccessToken(null);
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
              window.location.href = '/login';
            }
            return null;
          }
        }).catch((err) => {
          console.error('Failed to refresh token:', err);
          setAccessToken(null);
          return null;
        }).finally(() => {
          refreshTokenPromise = null;
        });
      }

      const newAccessToken = await refreshTokenPromise;
      if (newAccessToken) {
        currentHeaders['Authorization'] = `Bearer ${newAccessToken}`;
        const retryOptions: RequestInit = {
          ...restOptions,
          headers: currentHeaders,
          credentials: 'include',
        };
        response = await fetch(`${API_BASE_URL}${endpoint}`, retryOptions);
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
