
const API_BASE_URL = "http://127.0.0.1:8000/api"

export async function getEmployee(employeeId) {
  const response = await fetch(
    `${API_BASE_URL}/employees/${employeeId}`
  )

  if (!response.ok) {
    throw new Error("Unable to fetch employee profile")
  }

  return response.json()
}

export async function getEmployeeSkills(employeeId) {
  const response = await fetch(
    `${API_BASE_URL}/employees/${employeeId}/skills`
  )

  if (!response.ok) {
    throw new Error("Unable to fetch employee skills")
  }

  return response.json()
}
