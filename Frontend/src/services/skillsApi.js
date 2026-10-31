
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const API_BASE_URL = `${BACKEND_URL}/api/skills`;


async function request(url, options = {}) {
  const response = await fetch(url, {
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


// ==================================================
// GET EMPLOYEE SKILLS
// ==================================================

export async function getEmployeeSkills(employeeId) {
  if (!employeeId) {
    throw new Error("Employee ID is missing.");
  }

  return request(
    `${API_BASE_URL}/${encodeURIComponent(employeeId)}`
  );
}


// ==================================================
// EXTRACT SKILLS
// ==================================================

export async function extractSkills(payload) {
  if (!payload?.employee_id) {
    throw new Error("Employee ID is missing.");
  }

  return request(`${API_BASE_URL}/extract`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


// ==================================================
// CONFIRM SKILLS
// ==================================================

export async function confirmSkills(payload) {
  if (!payload?.employee_id) {
    throw new Error("Employee ID is missing.");
  }

  if (!Array.isArray(payload.confirmed_skills)) {
    throw new Error("Invalid confirmed skills list.");
  }

  return request(`${API_BASE_URL}/confirm`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


// ==================================================
// GET AUDIT LOGS
// ==================================================

export async function getSkillsAuditLogs() {
  return request(`${API_BASE_URL}/audit/logs`);
}


// ==================================================
// CACHE COMPATIBILITY HELPERS
// ==================================================

// Kept so existing imports elsewhere do not break.
// This API service no longer caches employee skills.

export function invalidateEmployeeSkills() {
  // No cache to invalidate.
}

export function clearEmployeeSkillsCache() {
  // No cache to clear.
}
