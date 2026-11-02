# ByteForge-Inclusive-Talent-Navigator

## Backend document extraction

Text-based PDF and DOCX files are read automatically. Scanned PDFs require
Tesseract OCR to be installed separately, with `TESSERACT_CMD` set in
`Backend/.env` when the executable is not on `PATH`, for example:

```env
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
```

The backend dependencies include the Python OCR integration and PDF rendering
packages. If OCR is unavailable, scanned uploads return an explicit error
instead of being saved with an empty profile.

## Contributor context

See [AGENT_CONTEXT](./AGENT_CONTEXT/README.md) before modifying the backend.
It documents the current architecture, MCP boundaries, workflows, and
validation commands for contributors and coding agents.