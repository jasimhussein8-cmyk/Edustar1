// Configuration for the application
// When building for mobile (APK), change API_BASE_URL to your production server URL
// Example: https://your-app-name.run.app

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
