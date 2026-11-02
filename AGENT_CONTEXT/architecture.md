# Architecture

## Request path

```text
Frontend
  -> FastAPI route
  -> authentication and request validation
  -> controller
  -> model fetches required data
  -> agent
  -> MCP client
  -> domain MCP server/tool
  -> agent interprets structured result
  -> model persists results and audit event
  -> controller response
```

## Layer responsibilities

### Routes

Routes define HTTP endpoints, authentication dependencies, request schemas, and
response schemas. They should not contain domain calculations or SQL.

### Controllers

Controllers perform simple orchestration:

- validate request-level conditions;
- call models to fetch inputs;
- call agents;
- call models to persist results;
- shape the existing API response.

### Models

Models own database access. They fetch the data required by agents, persist
agent output, and write central events to `AUDIT_LOGS`.

### Agents

Agents own domain reasoning and MCP client calls. They must not open database
connections, execute SQL, write local audit files, or silently fall back to a
non-MCP implementation.

### MCP servers

MCP servers expose specialized tools and return structured JSON results. They
must not replace domain-level orchestration or persistence.

Skills, Market Intelligence, and Career Development MCP tools receive
database-backed domain data from their model/controller boundary. They do not
call external LLMs or read runtime JSON datasets.

## MCP boundaries

| Domain | Agent entry point | MCP server | Tool |
|---|---|---|---|
| Skills Discovery | `SkillsDiscoveryAgent` | `mcp_server/skill_mcp_server.py` | `extract_skills`, `normalize_skills` |
| Opportunity Matching | `run_inclusive_matching` | `mcp_server/matching_mcp_server.py` | `run_matching` |
| Bias Review | `run_bias_audit` | `mcp_server/bias_mcp_server.py` | `run_bias_audit` |
| Market Intelligence | `run_market_intelligence` | `mcp_server/market_mcp_server.py` | `analyze_market_demand` |
| Career Development | `run_learning_pathway` | `mcp_server/learning_mcp_server.py` | `generate_learning_pathway` |

The public agent entry points remain compatible with their controllers. The
MCP server invokes an internal domain core so the server performs the
specialized calculation while the agent owns transport and response handling.

## Persistence

The central audit table is `AUDIT_LOGS`. Do not add per-agent JSON audit files.
Matching persistence is handled by `app/models/matching_model.py`; Bias Review
persistence is handled by `app/models/bias_audit_model.py`; Skills persistence
is handled by `app/models/skills_model.py`; Market Intelligence persistence is
handled by `app/models/market_model.py`; Career Development persistence is
handled by `app/models/learning_model.py`.

Domain-data tables are defined and seeded in
`Backend/database/migrations/001_agent_domain_data_mysql.sql` and
`001_agent_domain_data_hana.sql`.
