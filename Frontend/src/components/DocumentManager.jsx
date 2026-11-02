import { useEffect, useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import {
  getEmployeeDocuments,
  uploadDocuments,
  deleteEmployeeDocument,
} from "../services/documentsApi";

export default function DocumentManager({ employeeId, onDocumentsChanged }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef(null);

  async function loadDocuments() {
    if (!employeeId) return;
    try {
      setLoading(true);
      setError("");
      const data = await getEmployeeDocuments(employeeId);
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err.message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, [employeeId]);

  async function handleFileSelect(e) {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const result = await uploadDocuments(employeeId, selectedFiles);
      setSuccess(
        `Uploaded ${result.uploaded_count || selectedFiles.length} document(s) successfully! Profile text rebuilt.`
      );
      await loadDocuments();
      if (onDocumentsChanged) {
        onDocumentsChanged();
      }
    } catch (err) {
      setError(err.message || "Failed to upload document.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDelete(docId) {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      setDeletingId(docId);
      setError("");
      setSuccess("");

      await deleteEmployeeDocument(employeeId, docId);
      setSuccess("Document deleted and profile updated.");
      await loadDocuments();
      if (onDocumentsChanged) {
        onDocumentsChanged();
      }
    } catch (err) {
      setError(err.message || "Failed to delete document.");
    } finally {
      setDeletingId(null);
    }
  }

  function formatBytes(bytes) {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Profile Documents
          </h2>
          <p className="text-xs text-slate-500">
            Upload resumes, profiles, or supporting documents up to 10 MB to extract verified skills.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDocuments}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ERROR & SUCCESS MESSAGES */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* UPLOAD DROP ZONE */}
      <div className="mt-5">
        <label
          htmlFor="file-upload"
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <UploadCloud size={24} />
          </div>

          <p className="mt-3 text-sm font-medium text-slate-800">
            {uploading ? "Processing & rebuilding profile..." : "Click to select documents"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Supports PDF, DOCX, TXT, RTF, XLSX, PPTX, and common images (Max 10 MB)
          </p>

          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.text,.rtf,.xlsx,.pptx,.png,.jpg,.jpeg,.tif,.tiff,.bmp,.webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/rtf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* UPLOADED DOCUMENTS LIST */}
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Uploaded Documents ({documents.length})
        </p>

        {loading ? (
          <div className="mt-3 flex items-center justify-center p-6 text-slate-400">
            <RefreshCw size={18} className="animate-spin mr-2" />
            <span className="text-xs">Loading uploaded files...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/60 p-5 text-center text-xs text-slate-500">
            No documents uploaded yet. Upload your resume or CV to extract skills automatically.
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {documents.map((doc) => {
              const docId = doc.document_id || doc.DOCUMENT_ID;
              const fileName = doc.file_name || doc.FILE_NAME || "Document";
              const docType = doc.document_type || doc.DOCUMENT_TYPE || "FILE";
              const fileSize = doc.file_size || doc.FILE_SIZE;
              const createdAt = doc.created_at || doc.CREATED_AT;

              return (
                <div
                  key={docId}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm transition hover:border-slate-300"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <FileText size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800">
                        {fileName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                          {docType}
                        </span>
                        {fileSize && <span>{formatBytes(fileSize)}</span>}
                        {createdAt && (
                          <span>
                            • {new Date(createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(docId)}
                    disabled={deletingId === docId}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    title="Delete document"
                  >
                    {deletingId === docId ? (
                      <RefreshCw size={14} className="animate-spin text-red-600" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
