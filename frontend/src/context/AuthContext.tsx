import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Extend the AuthContextType to include `user`
interface User {
  username: string;
  userId: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;  // Add user object to context
  login: (token: string, user: User) => void;  // Accept user object when logging in
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("access_token"));
  const [user, setUser] = useState<User | null>(null);  // Store the user data

  useEffect(() => {
    if (token) {
      fetch("http://localhost:8080/token", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && data.username && data.user_id) {
            // Store the user data in the context
            setUser({ username: data.username, userId: data.user_id });
          }
        })
        .catch(() => {
          console.error("Failed to fetch user data.");
          logout(); // Log out if token is invalid
        });
    }
  }, [token]);

  const login = (newToken: string, user: User) => {
    localStorage.setItem("access_token", newToken);
    setToken(newToken);
    setUser(user);  // Set user data during login
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);  // Clear user data during logout
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
