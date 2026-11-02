const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const API_BASE_URL = `${BACKEND_URL}/api/hr/jobs`;

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
      data.detail || data.message || "Job role request failed."
    );
  }

  return data;
}

// List all job roles
export async function getJobRoles() {
  return request("/");
}

// Get single job role details
export async function getJobRole(jobRoleId) {
  return request(`/${encodeURIComponent(jobRoleId)}`);
}

// Create a new job role
export async function createJobRole(payload) {
  return request("/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Edit an existing job role
export async function updateJobRole(jobRoleId, payload) {
  return request(`/${encodeURIComponent(jobRoleId)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Activate or deactivate a job role
export async function updateJobRoleStatus(jobRoleId, status) {
  return request(`/${encodeURIComponent(jobRoleId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// Add required skills to an existing job role
export async function addSkillsToJobRole(jobRoleId, skills) {
  return request(`/${encodeURIComponent(jobRoleId)}/skills`, {
    method: "POST",
    body: JSON.stringify({ skills }),
  });
}

// Remove a required skill from a job role
export async function removeSkillFromJobRole(jobRoleId, requirementId) {
  return request(
    `/${encodeURIComponent(jobRoleId)}/skills/${encodeURIComponent(requirementId)}`,
    { method: "DELETE" }
  );
}

// Get HR audit logs
export async function getHRAuditLogs() {
  return request("/audit/logs");
}
