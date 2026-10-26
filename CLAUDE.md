# Claude Operating Contract — jussray/Living-Truth

Living Truth is a **standalone** evidence reconciliation engine. It is not Entitled or any other product. Never change it to suit another app, and never change another app for it. `README.md` and `docs/GOVERNANCE.md` hold its boundaries; they win over this file.

## Runtime (observed on `main` 594c71a, 2026-10-26)
- Plain Node ESM library (`src/truth-core.js`, `src/contracts.js`, `src/base44-adapter.js`), Node >= 20, **no third-party dependencies**.
- The Base44 app (`base44/app.json`, canonical app id in `README.md`) owns the interactive UI and persistent entities. This repo owns the portable truth contract, reconciliation logic and tests. Changing Base44 entities or data is a provider mutation and needs Juss's explicit go.
- No deploy carrier lives here.

## Commands
| Purpose | Command |
| --- | --- |
| Tests (no install needed) | `npm test` (`node --test`) |

CI: `.github/workflows/ci.yml` runs `npm test` on Node 20. `governance.yml` fails unless `main` branch protection is on.

## Claude
- Model lane: `.control-room/model-capabilities.v1.json` lists `anthropic/claude` as a **trial** lane with no selection, execution, merge, deploy, publish, spend or provider-mutation authority. The exact model is chosen per invocation by the provider execution host.
- Cloud sessions: the npm registry can be blocked in Claude Code cloud containers. If install fails, nothing is lost: this repo has no dependencies, so `npm test` always runs locally.
- Gates: merge, deploy, publish, secrets, database writes and provider changes need Juss's explicit go for the exact PR and head SHA. A branch push or green CI is evidence, not authority.
- Report every change as REALITY / FIX / PROOF / RISK / ROLLBACK / NEXT GATE.
