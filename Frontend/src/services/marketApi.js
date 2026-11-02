const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const API_BASE_URL = `${BACKEND_URL}/api/market`;

export async function getMarketIntelligence() {
  const response = await fetch(`${API_BASE_URL}/intelligence`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || "Failed to load market intelligence."
    );
  }

  return data;
}

