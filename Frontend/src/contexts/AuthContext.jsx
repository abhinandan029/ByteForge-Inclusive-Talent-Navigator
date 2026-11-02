
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const AUTH_URL = `${BACKEND_URL}/api/auth`;

async function authRequest(endpoint, options = {}) {
  const response = await fetch(`${AUTH_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      `Request failed (${response.status})`
    );
  }

  return data;
}

export function AuthProvider({ children }) {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check whether an employee already has an active session.
  async function checkAuth() {
    try {
      const data = await authRequest("/me");
      setEmployee(data);
      return data;
    } catch {
      setEmployee(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  // Employee login.
  async function login(employeeId, password) {
    const data = await authRequest("/login", {
      method: "POST",
      body: JSON.stringify({
        employee_id: employeeId,
        password,
      }),
    });

    const currentEmployee = await authRequest("/me");

    setEmployee(currentEmployee);

    return {
      ...data,
      employee: currentEmployee,
    };
  }

  // Change the temporary password.
  async function changePassword(newPassword) {
    const data = await authRequest("/change-password", {
      method: "POST",
      body: JSON.stringify({
        new_password: newPassword,
      }),
    });

    const currentEmployee = await authRequest("/me");

    setEmployee(currentEmployee);

    return data;
  }

  // Employee logout.
  async function logout() {
    try {
      await authRequest("/logout", {
        method: "POST",
      });
    } finally {
      setEmployee(null);
    }
  }

  const value = {
    employee,
    loading,
    isAuthenticated: Boolean(employee),
    login,
    logout,
    changePassword,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
