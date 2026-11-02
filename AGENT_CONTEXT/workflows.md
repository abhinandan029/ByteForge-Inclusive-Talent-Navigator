# Workflows

## Document and Skills Discovery

1. An authenticated employee uploads PDF or DOCX files.
2. `document_controller.py` validates files and uses
   `app/utils/document_extractor.py`.
3. The document model stores files and rebuilds `EMPLOYEES.PROFILE_TEXT`.
4. `/api/skills/extract` fetches profile text through the skills model.
5. `SkillsDiscoveryAgent` calls the Skills MCP server to extract and normalize
   skills.
6. The skills model stores pending drafts.
7. The employee confirms, removes, or manually adds skills.
8. Manual additions are normalized through MCP before the model stores final
   confirmed skills.

## Opportunity Matching

1. HR calls `POST /api/hr/matching/run`.
2. The matching controller fetches eligible employees, active roles, required
   skills, and confirmed employee skills through the matching model.
3. `run_inclusive_matching` starts `matching_mcp_server.py` over stdio.
4. The MCP `run_matching` tool calculates weighted skill matches and experience
   warnings.
5. The agent validates the structured result and returns it to the controller.
6. The matching model persists results and central audit events.
7. The controller reloads persisted results and returns the existing response.

Matching uses exact normalized skill names and evidence phrases. It does not
assume that related technologies are interchangeable.

## Bias Review

1. HR calls `POST /api/hr/bias/run`.
2. The bias model fetches matching results and role criteria.
3. `run_bias_audit` starts `bias_mcp_server.py` over stdio.
4. The MCP `run_bias_audit` tool evaluates role wording and matching review
   indicators.
5. The agent validates the structured audit result.
6. The bias model persists flags and the HR summary to the database.
7. The controller returns the existing audit response.

Bias flags are review indicators, not automated findings of discrimination.
HR remains responsible for reviewing flags and recording decisions.

## Market and Career Development

`agents/market_agent.py` and `agents/learning_agent.py` contain domain
implementations, but they are not currently wired into FastAPI routes. Any
future integration must follow the same MCP boundary and model/controller
ownership rules instead of calling them directly from routes.
