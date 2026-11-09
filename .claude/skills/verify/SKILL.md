---
name: verify
description: Check whether the MCP server is done. Use after each build step, and before saying the work is done.
---

Run the checks below. Report each failing check with its error, or say that every check passed. Don't fix anything here, and don't reset anything.

## The checks

1. **The tests pass:** `npm test`.
2. **A live run, as IT would:** `npm run live-check`, with the test environment running. It takes the two tokens from `ROUTA_TOKEN` and `ROUTA_READONLY_TOKEN`, which are already in the environment. Don't read the token files.
3. **The security judge:** a fresh agent, one that didn't build the server, reads it against a file of criteria. The criteria file is an input: use the path the user gave, or `client/security-criteria.md` if none. Swapping the file changes what the judge checks; don't change the rest of this check.

   Start it with the Agent tool as a new agent (`subagent_type: "general-purpose"`, not a fork), so it carries none of this conversation. Don't tell it what you built, what you expect, or what you think is fine. Give it only this brief, with the criteria path filled in:

   > You are a security reviewer. You did not build this server and know nothing about how it was built. Read the MCP server in `mcp/src/` (every file, whole) against the criteria in `<criteria path>`. Read only; change nothing, and don't read token files or print any token. For each place the server breaks a criterion, report a finding with: a severity of `low`, `medium`, `high` or `critical` (use the criteria's own wording to decide, and say which criterion it breaks); the file and line, quoted exactly as you saw them; and one sentence on why. Report only what you saw in the code, never from assumption. If you find nothing, say so. End with one line: `HIGHEST: <severity or none>`.

   When it reports:
   - Show each finding as the judge wrote it, with its severity, file and line. Don't soften, re-rate or drop any. If one has no quoted file and line, send it back to the judge for them.
   - **The check fails if any finding is `high` or `critical`.** Low and medium findings are listed and noted, and don't fail it.
   - If the criteria file can't be read, the check fails; don't fall back to anything else.

## The result

Say which checks passed and which failed. A failed security judge lists its high and critical findings first. Nothing moves on while any check fails.
