export interface User {
  id: number;
  email: string;
  name: string;
  createdAt?: string;
}

export interface HabitLog {
  id: number;
  habitId: number;
  completed: boolean;
  date: string;
  notes?: string | null;
}

export interface Habit {
  id: number;
  name: string;
  description?: string | null;
  frequency: 'daily' | 'weekly' | 'monthly';
  color: string;
  icon: string;
  createdAt: string;
  logs: HabitLog[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  authenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}
