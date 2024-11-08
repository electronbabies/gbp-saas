import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Agency } from '../lib/supabase';

const MOCK_AGENCY: Agency = {
  id: 'demo',
  name: 'Demo Agency',
  email: 'demo@example.com',
  created_at: new Date().toISOString()
};

interface AuthState {
  agency: Agency | null;
  loading: boolean;
  error: string | null;
  apiKeys: {
    googlePlaces?: string;
    openai?: string;
  };
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  setError: (error: string | null) => void;
  updateApiKeys: (keys: { googlePlaces?: string; openai?: string }) => void;
}

// Initialize API keys from environment variables
const defaultApiKeys = {
  googlePlaces: import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '',
  openai: import.meta.env.VITE_OPENAI_API_KEY || ''
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      agency: null,
      loading: true,
      error: null,
      apiKeys: defaultApiKeys,
      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          
          if (email === 'demo@example.com' && password === 'demo') {
            set({ 
              agency: MOCK_AGENCY,
              loading: false,
              apiKeys: defaultApiKeys
            });
            return;
          }
          
          throw new Error('Invalid credentials. Use demo@example.com / demo');
        } catch (err) {
          set({ 
            error: err instanceof Error ? err.message : 'Authentication failed', 
            loading: false 
          });
          throw err;
        }
      },
      signOut: async () => {
        try {
          set({ loading: true, error: null });
          set({ 
            agency: null, 
            loading: false,
            apiKeys: defaultApiKeys
          });
        } catch (err) {
          set({ 
            error: err instanceof Error ? err.message : 'Sign out failed',
            loading: false 
          });
        }
      },
      initialize: async () => {
        try {
          set({ loading: true, error: null });
          set({ 
            apiKeys: defaultApiKeys,
            loading: false 
          });
        } catch (err) {
          console.error('Initialization error:', err);
          set({ 
            error: err instanceof Error ? err.message : 'Initialization failed',
            loading: false 
          });
        }
      },
      setError: (error: string | null) => set({ error }),
      updateApiKeys: (keys) => {
        const currentKeys = get().apiKeys;
        const newKeys = { ...currentKeys, ...keys };
        set({ apiKeys: newKeys });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        agency: state.agency,
        apiKeys: state.apiKeys
      })
    }
  )
);