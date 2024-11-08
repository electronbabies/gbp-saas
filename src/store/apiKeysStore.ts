import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_KEYS_STORAGE_KEY = 'gbp-optimizer-api-keys';

interface ApiKeysState {
  apiKeys: {
    googlePlaces?: string;
    openai?: string;
  };
  updateApiKeys: (keys: { googlePlaces?: string; openai?: string }) => void;
}

// Function to get API keys from localStorage directly
export const getStoredApiKeys = () => {
  try {
    const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (!stored) return {};
    
    const parsed = JSON.parse(stored);
    return parsed.state?.apiKeys || {};
  } catch (error) {
    console.error('Failed to get stored API keys:', error);
    return {};
  }
};

// Function to store API keys in localStorage directly
export const storeApiKeys = (keys: { googlePlaces?: string; openai?: string }) => {
  try {
    const currentKeys = getStoredApiKeys();
    const newKeys = { ...currentKeys, ...keys };
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify({ 
      state: { apiKeys: newKeys }
    }));
    return newKeys;
  } catch (error) {
    console.error('Failed to store API keys:', error);
    return keys;
  }
};

export const useApiKeysStore = create<ApiKeysState>()(
  persist(
    (set) => ({
      apiKeys: getStoredApiKeys(),
      updateApiKeys: (keys) => {
        const newKeys = storeApiKeys(keys);
        set({ apiKeys: newKeys });
      }
    }),
    {
      name: API_KEYS_STORAGE_KEY
    }
  )
);