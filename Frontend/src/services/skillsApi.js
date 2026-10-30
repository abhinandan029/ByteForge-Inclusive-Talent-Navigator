
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const API_BASE_URL = `${BACKEND_URL}/api/skills`;

const CACHE_DURATION = 15 * 1000;

const employeeSkillsCache = new Map();
const employeeSkillsRequests = new Map();

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
      data?.detail || data?.message || `Request failed (${response.status})`
    );
  }

  return data;
}

// GET EMPLOYEE SKILLS
export async function getEmployeeSkills(employeeId) {
  if (!employeeId) {
    throw new Error("Employee ID is missing.");
  }

  const cached = employeeSkillsCache.get(employeeId);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Reuse an already-running request for this employee.
  if (employeeSkillsRequests.has(employeeId)) {
    return employeeSkillsRequests.get(employeeId);
  }

  const promise = request(
    `${API_BASE_URL}/${encodeURIComponent(employeeId)}`
  )
    .then((data) => {
      employeeSkillsCache.set(employeeId, {
        data,
        timestamp: Date.now(),
      });

      return data;
    })
    .finally(() => {
      employeeSkillsRequests.delete(employeeId);
    });

  employeeSkillsRequests.set(employeeId, promise);

  return promise;
}

// EXTRACT SKILLS
export async function extractSkills(payload) {
  const data = await request(`${API_BASE_URL}/extract`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  invalidateEmployeeSkills(payload.employee_id);

  return data;
}

// CONFIRM SKILLS
export async function confirmSkills(payload) {
  const data = await request(`${API_BASE_URL}/confirm`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  invalidateEmployeeSkills(payload.employee_id);

  return data;
}

// AUDIT LOGS
export async function getSkillsAuditLogs() {
  return request(`${API_BASE_URL}/audit/logs`);
}

// CLEAR CACHED DATA AFTER A MUTATION
export function invalidateEmployeeSkills(employeeId) {
  if (employeeId) {
    employeeSkillsCache.delete(employeeId);
  }
}

// CLEAR ALL CACHED DATA (useful when changing accounts)
export function clearEmployeeSkillsCache() {
  employeeSkillsCache.clear();
  employeeSkillsRequests.clear();
}
