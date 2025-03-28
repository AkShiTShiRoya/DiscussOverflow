import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const authContextValue = useMemo(
    () => ({ isLoggedIn, setIsLoggedIn }),
    [isLoggedIn],
  );

  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      setIsLoggedIn(true);
    }
    const timer = setInterval(() => {
      const refreshTokenValue = localStorage.getItem("refreshToken");
      if (!refreshTokenValue && isLoggedIn) {
        setIsLoggedIn(false);
      }
    }, 500);

    return () => clearInterval(timer);
  }, []);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
