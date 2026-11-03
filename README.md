# ByteForge-Inclusive-Talent-Navigator

## Backend document extraction

PDF, DOCX, TXT, RTF, XLSX, PPTX, and common image files are read automatically.
Scanned PDFs and image uploads require Tesseract OCR to be installed separately, with `TESSERACT_CMD` set in
`Backend/.env` when the executable is not on `PATH`, for example:

```env
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
```

The backend dependencies include the Python OCR integration and PDF rendering
packages. If OCR is unavailable, scanned uploads return an explicit error
instead of being saved with an empty profile.

Uploaded documents are rebuilt into `PROFILE_TEXT` with document boundaries and
source metadata. Skill extraction preserves section context, handles bullets,
wrapped lines, table-style separators, canonical names, and aliases, and stores
the containing line as evidence for employee review.

## Structured employee progress

Document extraction is optional. Employees can add career goals and project
evidence from the Skills page through the `/api/progress` endpoints. Confirmed
skills receive inferred proficiency and evidence-confidence metadata, while
matching exposes skill coverage, evidence strength, learning progress, and
experience-fit breakdowns. HR can record manager validation through the
manager-validation endpoint; validation is an auditable signal and does not
silently override the matching score.

Market intelligence labels live active-role demand separately from simulated
fallback data. SAP Learning Hub API synchronization is intentionally not
enabled until an approved SuccessFactors Learning tenant and API credentials
are provided.

## Contributor context

See [AGENT_CONTEXT](./AGENT_CONTEXT/README.md) before modifying the backend.
It documents the current architecture, MCP boundaries, workflows, and
validation commands for contributors and coding agents.