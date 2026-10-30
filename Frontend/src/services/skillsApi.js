const API_BASE_URL = "/api/v1/skills"

export async function getEmployeeSkills(employeeId = "emp-ananya") {
  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(employeeId)}`
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)

    throw new Error(
      errorData?.detail ||
        `Unable to fetch skills for employee ${employeeId}`
    )
  }

  return response.json()
}

export async function extractSkills(payload) {
  const response = await fetch(`${API_BASE_URL}/extract`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)

    throw new Error(
      errorData?.detail || "Unable to extract skills"
    )
  }

  return response.json()
}

export async function confirmSkills(payload) {
  const response = await fetch(`${API_BASE_URL}/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)

    throw new Error(
      errorData?.detail || "Unable to confirm skills"
    )
  }

  return response.json()
}

export async function getSkillsAuditLogs() {
  const response = await fetch(`${API_BASE_URL}/audit/logs`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)

    throw new Error(
      errorData?.detail || "Unable to fetch skills audit logs"
    )
  }

  return response.json()
}