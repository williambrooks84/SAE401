import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthContextType } from "../interfaces/dataDefinitions"; 

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
            setUser({ username: data.username, userId: data.user_id });
          }
        })
        .catch(() => {
          console.error("Failed to fetch user data.");
          logout();
        });
    }
  }, [token]);

  const login = (newToken: string, user: User) => {
    localStorage.setItem("access_token", newToken);
    setToken(newToken);
    setUser(user); 
  };

  const logout = () => {
    if (token) {
      fetch("http://localhost:8080/logout", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to log out.");
          }
        })
        .catch((error) => console.error("Logout error:", error));
    }
  
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
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