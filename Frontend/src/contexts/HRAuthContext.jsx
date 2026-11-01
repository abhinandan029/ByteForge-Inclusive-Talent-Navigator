
import { createContext, useContext, useEffect, useState } from "react";

const HRAuthContext = createContext(null);

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export function HRAuthProvider({ children }) {
  const [hr, setHr] = useState(null);
  const [loading, setLoading] = useState(true);

  async function getHRProfile() {
    const response = await fetch(`${API_BASE_URL}/api/hr/me`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      setHr(null);
      return null;
    }

    const data = await response.json();
    setHr(data);
    return data;
  }

  async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/api/hr/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.detail || data.message || "Unable to sign in as HR."
      );
    }

    // The backend sets the HTTP-only hr_token cookie.
    // The login response contains the HR profile under data.hr.
    setHr(data.hr);

    return data;
  }

  async function logout() {
    try {
      await fetch(`${API_BASE_URL}/api/hr/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setHr(null);
    }
  }

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/hr/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          if (active) setHr(null);
          return;
        }

        const data = await response.json();

        if (active) setHr(data);
      } catch {
        if (active) setHr(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  return (
    <HRAuthContext.Provider
      value={{
        hr,
        loading,
        login,
        logout,
        refreshHR: getHRProfile,
      }}
    >
      {children}
    </HRAuthContext.Provider>
  );
}

export function useHRAuth() {
  const context = useContext(HRAuthContext);

  if (!context) {
    throw new Error("useHRAuth must be used inside HRAuthProvider");
  }

  return context;
}
