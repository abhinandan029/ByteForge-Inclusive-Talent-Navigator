const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const API_BASE_URL = `${BACKEND_URL}/api/documents`;

export async function uploadDocuments(employeeId, files) {
  if (!employeeId) {
    throw new Error("Employee ID is required.");
  }
  if (!files || files.length === 0) {
    throw new Error("Please select at least one file to upload.");
  }

  const formData = new FormData();
  formData.append("employee_id", employeeId);
  for (const file of files) {
    formData.append("files", file);
  }

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      typeof data.detail === "string"
        ? data.detail
        : data.detail?.message || data.message || "Failed to upload document.";
    throw new Error(errorMsg);
  }

  return data;
}

export async function getEmployeeDocuments(employeeId) {
  if (!employeeId) {
    throw new Error("Employee ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(employeeId)}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || "Unable to fetch employee documents."
    );
  }

  return data;
}

export async function deleteEmployeeDocument(employeeId, documentId) {
  if (!employeeId || !documentId) {
    throw new Error("Employee ID and Document ID are required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(employeeId)}/${encodeURIComponent(documentId)}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || "Failed to delete document."
    );
  }

  return data;
}

