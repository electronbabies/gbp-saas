// API key validation and management
export function validateGoogleMapsKey(key: string | undefined): string {
  if (!key) {
    throw new Error('Google Places API key is not configured');
  }
  
  // Basic validation for Google Maps API key format
  if (!key.match(/^[A-Za-z0-9_-]{30,}$/)) {
    throw new Error('Invalid Google Places API key format');
  }
  
  return key;
}

export function getGoogleMapsKey(): string {
  const key = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  return validateGoogleMapsKey(key);
}