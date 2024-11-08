// Token management for embedded scanner
const TOKEN_KEY = 'gbp_embed_token';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface TokenData {
  agencyId: string;
  keys: {
    googlePlaces: string;
    openai: string;
  };
  expires: number;
}

export function generateEmbedToken(agencyId: string, googlePlaces: string, openai: string): string {
  const data: TokenData = {
    agencyId,
    keys: { googlePlaces, openai },
    expires: Date.now() + TOKEN_EXPIRY
  };
  
  return btoa(JSON.stringify(data));
}

export function parseEmbedToken(token: string): TokenData | null {
  try {
    const data = JSON.parse(atob(token));
    
    if (!data.agencyId || !data.keys?.googlePlaces || !data.keys?.openai || !data.expires) {
      return null;
    }
    
    if (data.expires < Date.now()) {
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
}

export function storeEmbedToken(token: string) {
  try {
    const data = parseEmbedToken(token);
    if (!data) return false;

    localStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch {
    return false;
  }
}

export function getStoredEmbedToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearEmbedToken() {
  localStorage.removeItem(TOKEN_KEY);
}