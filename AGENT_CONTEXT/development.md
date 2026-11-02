# Development Guide

## Backend layout

```text
Backend/
  main.py                 FastAPI application
  agents/                 Domain agents and MCP client orchestration
  app/routes/             HTTP routes
  app/controllers/        Request orchestration
  app/models/             Database access and persistence
  app/schemas/            Pydantic request/response models
  app/utils/              Shared extraction, auth, and audit helpers
  mcp_server/             FastMCP server tools
  data/                   Static course, role, and market datasets
```

## Useful commands on Windows

Run from the repository root:

```powershell
& .\Backend\.venv\Scripts\python.exe -m compileall -q .\Backend
```

Run the backend:

```powershell
Push-Location .\Backend
& .\.venv\Scripts\python.exe -m uvicorn main:app --reload
Pop-Location
```

Run a focused MCP smoke test from `Backend`:

```powershell
Push-Location .\Backend
& .\.venv\Scripts\python.exe -c "from agents.matching_agent import run_inclusive_matching; print(run_inclusive_matching([], [], [], []))"
Pop-Location
```

## Change checklist

- Read the relevant route, controller, model, agent, and MCP server first.
- Preserve existing request and response schemas.
- Keep database access in models.
- Keep domain decisions in agents/MCP tools, not controllers.
- Validate MCP responses and raise explicit errors.
- Do not add local audit files or secrets.
- Run compilation and a focused real MCP-path smoke test.
- For FastAPI 0.162+, included routers may appear as deferred router entries;
  validate new paths through the router's own `.routes` or the generated
  OpenAPI schema rather than assuming every path is directly on `app.routes`.
- Check `git diff` and avoid changing unrelated worktree files.

## Environment notes

- The backend uses the configured database adapter from
  `app/database/connection.py`; supported adapters include MySQL and SAP HANA.
- `Backend/.venv` and `Frontend/node_modules` are local dependency directories
  and should not be edited as application source.
- Document uploads currently support PDF and DOCX. Scanned PDFs are rejected
  because no OCR provider is configured.
