import { create } from 'zustand';
import type { AuthState } from '../lib/types';
import { getToken, setToken, clearToken } from '../lib/api';

const initialToken = getToken();

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: initialToken,
  authenticated: !!initialToken,
  setAuth: (user, token) => {
    setToken(token);
    set({ user, token, authenticated: true });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    clearToken();
    set({ user: null, token: null, authenticated: false });
  }
}));
