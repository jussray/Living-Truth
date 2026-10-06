# Living Truth

Living Truth is the canonical evidence and reconciliation engine for distinguishing what is **verified**, **inferred**, **unknown**, **blocked**, or **superseded**.

It is not Entitled. Entitled is a separate product with its own repository and job.

## Core loop

```text
CLAIM -> EVIDENCE -> RECONCILE -> RECEIPT -> CONTINUITY -> NEXT GATE
```

### Non-negotiable boundaries

- Evidence does not grant action authority.
- World evidence cannot verify project/runtime truth.
- Source/CI proof cannot be promoted into deployment/runtime proof.
- A changed subject version invalidates inherited proof.
- Historical evidence is preserved as provenance and superseded, not rewritten as current.
- Receipts and continuity cookies are always non-authorizing.

## Base44 binding

Canonical Base44 app id: `6a94a7bfcbb4366d37894ffd`.

The Base44 app owns the interactive operator UI and persistent entities. This repository owns the portable truth contract, deterministic reconciliation behavior, tests, and source-controlled architecture.

## Run

```bash
npm test
```

No third-party runtime dependencies are required.
