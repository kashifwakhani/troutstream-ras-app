/**
 * Dynamic API Base URL resolver.
 * When running inside a native Capacitor Android app, routes to the hosted Cloud Run backend.
 * When running in the browser, uses relative URLs.
 */
export const CLOUD_BACKEND_URL = 'https://ais-pre-c5iptdcajqw2bfzwrxuhal-515922572386.asia-east1.run.app';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Detect Capacitor Android container
    const isCapacitor =
      window.location.protocol === 'capacitor:' ||
      (window as any).Capacitor?.isNativePlatform?.() ||
      window.location.origin.includes('localhost');

    // If explicit env var is set, prefer that
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }

    if (isCapacitor && window.location.protocol === 'capacitor:') {
      return CLOUD_BACKEND_URL;
    }
  }
  return '';
}

export async function fetchFromBackend<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
