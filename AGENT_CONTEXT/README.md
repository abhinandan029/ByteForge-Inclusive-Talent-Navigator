# Agent Context

This folder is the shared orientation guide for contributors and coding agents
working on Inclusive Talent Navigator.

Read these documents in order:

1. [Architecture](./architecture.md) - system layers and ownership rules.
2. [Workflows](./workflows.md) - the current end-to-end feature flows.
3. [Development](./development.md) - local commands, validation, and change rules.

## Project summary

Inclusive Talent Navigator is a FastAPI and React application for inclusive
internal talent discovery. Employees upload profile documents, review extracted
skills, and become eligible for internal opportunity matching. HR users can run
matching and bias review workflows.

## Important current state

- Skills Discovery, Opportunity Matching, and Bias Review use MCP client/server
  boundaries.
- Skills Discovery, Market Intelligence, and Career Development use only
  deterministic code plus database-provided domain data; no external LLM is
  used.
- MCP servers use stdio transport and are launched by their corresponding
  Python agent.
- Agents do not access the database directly.
- Controllers coordinate requests and responses.
- Models own database reads, writes, and central `AUDIT_LOGS` persistence.
- Document text extraction currently uses local `pypdf` and `python-docx`.
- SAP Document AI is not part of the current implementation.
- Skill taxonomy, market demand, and learning courses are seeded through
  `Backend/database/mysql/` or `Backend/database/hana/` and are not read
  from runtime JSON files.

When changing an agent, preserve the public controller-facing function and
route response shape unless the task explicitly requires an API change.
