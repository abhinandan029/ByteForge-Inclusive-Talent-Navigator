const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const API_BASE_URL = `${BACKEND_URL}/api/learning`;

export async function getLearningPathway() {
  const response = await fetch(`${API_BASE_URL}/pathway`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || "Failed to load learning pathway."
    );
  }

  return data;
}

