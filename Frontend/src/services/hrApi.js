const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || "Something went wrong. Please try again."
    );
  }

  return data;
}

export const getBiasFlags = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });

  const query = params.toString();

  return request(`/api/hr/bias/flags${query ? `?${query}` : ""}`);
};

export const getBiasFlagDetails = (flagId) =>
  request(`/api/hr/bias/flags/${encodeURIComponent(flagId)}`);

export const reviewBiasFlag = (flagId, payload) =>
  request(`/api/hr/bias/flags/${encodeURIComponent(flagId)}/review`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const getMatchDecision = (matchId) =>
  request(`/api/hr/bias/decisions/${encodeURIComponent(matchId)}`);

export const submitMatchDecision = (matchId, payload) =>
  request(`/api/hr/bias/decisions/${encodeURIComponent(matchId)}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const runBiasAudit = (payload = {}) =>
  request("/api/hr/bias/run", {
    method: "POST",
    body: JSON.stringify(payload),
  });
