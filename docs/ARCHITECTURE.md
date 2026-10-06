# Living Truth Architecture

## Mission

Living Truth answers: **What is actually true right now, what evidence supports that state, what changed, and what must be observed next?**

It does not decide what a person is entitled to. That belongs to the separate Entitled product.

## Planes

1. **Claim plane** — exact statement, scope, expected identity/version, lineage, next gate.
2. **Evidence plane** — provider, reference, retrieved/as-of timestamps, domain, scope, witness class.
3. **Reconciliation plane** — deterministic comparison of expected and observed state.
4. **Receipt plane** — immutable result describing the comparison; never authority.
5. **Continuity plane** — fingerprints current evidence/state and invalidates inherited proof after movement.
6. **Presentation plane** — Base44 UI renders claims, evidence, receipts, contradictions, history, and next gates.

## Promotion rules

- Repository evidence can prove repository identity only.
- CI success can prove a CI execution only.
- Deployment evidence is required for deployment claims.
- Runtime observation is required for runtime claims.
- World evidence can inform hypotheses but cannot certify project state.
- Missing or conflicting load-bearing evidence never becomes VERIFIED.
- A receipt is descriptive. It cannot authorize merge, deploy, publish, send, spend, or deletion.

## Base44

Canonical app id: `6a94a7bfcbb4366d37894ffd`.

Expected persistent entities include Claim, Evidence, ReconciliationRule, ReconciliationRun, ReconciliationReceipt, ContinuityRecord, ContinuityCookie, AttackCard, and WorldRadarFinding.
