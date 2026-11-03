const API_BASE_URL =
  `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api/progress`;

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.message || "Progress request failed.");
  }
  return data;
}

export const getProgress = () => request(API_BASE_URL);
export const saveGoals = (payload) => request(`${API_BASE_URL}/goals`, {
  method: "PUT",
  body: JSON.stringify(payload),
});
export const addProject = (payload) => request(`${API_BASE_URL}/projects`, {
  method: "POST",
  body: JSON.stringify(payload),
});
export const deleteProject = (projectId) => request(
  `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}`,
  { method: "DELETE" }
);
