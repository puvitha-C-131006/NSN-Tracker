import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface CustomUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  employee_ref_id?: number;
}

interface AuthContextType {
  user: CustomUser | null;
  role: string | null;
  loading: boolean;
  login: (user: CustomUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('nsn_tracker_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as CustomUser;
        setUser(parsed);
        setRole(parsed.role);
      } catch (e) {
        localStorage.removeItem('nsn_tracker_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((newUser: CustomUser) => {
    setUser(newUser);
    setRole(newUser.role);
    localStorage.setItem('nsn_tracker_user', JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('nsn_tracker_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
