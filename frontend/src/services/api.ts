import { ApiError } from '../types/api';

const BASE_URL = process.env.REACT_APP_API_URL || '';

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
  }

  if (!response.ok) {
    const errorBody: ApiError = await response.json();
    throw new Error(errorBody.message || 'Request failed');
  }

  return response.json() as Promise<T>;
}
