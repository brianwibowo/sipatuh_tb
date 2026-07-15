import { useState, useEffect } from "react";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPass = sessionStorage.getItem("sipatuh_admin_password");
      if (storedPass) {
        setAdminPassword(storedPass);
        setIsAdmin(true);
      }
      setLoading(false);
    }
  }, []);

  const login = (password) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sipatuh_admin_password", password);
      setAdminPassword(password);
      setIsAdmin(true);
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("sipatuh_admin_password");
      setAdminPassword("");
      setIsAdmin(false);
    }
  };

  const getAdminHeaders = () => {
    return {
      "Content-Type": "application/json",
      "x-admin-password": adminPassword,
    };
  };

  return {
    isAdmin,
    adminPassword,
    loading,
    login,
    logout,
    getAdminHeaders,
  };
}
