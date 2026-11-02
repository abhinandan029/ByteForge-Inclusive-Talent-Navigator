const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const API_BASE_URL = `${BACKEND_URL}/api/hr/matching`;

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || "Failed to complete matching request."
    );
  }

  return data;
}

// Run Opportunity Matching Agent across eligible employees and active job roles
export async function runInclusiveMatching(payload = {}) {
  return request("/run", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// List all matching results with optional filters (employee_id, job_role_id)
export async function getHRMatchingResults(filters = {}) {
  const params = new URLSearchParams();
  if (filters.employee_id) params.append("employee_id", filters.employee_id);
  if (filters.job_role_id) params.append("job_role_id", filters.job_role_id);

  const query = params.toString();
  return request(`/results${query ? `?${query}` : ""}`);
}

// Retrieve details for a specific match ID
export async function getMatchingDetails(matchId) {
  if (!matchId) throw new Error("Match ID is required.");
  return request(`/results/${encodeURIComponent(matchId)}`);
}
