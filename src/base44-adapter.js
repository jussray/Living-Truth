import { reconcileClaim } from "./truth-core.js";

export function claimFromBase44(row) {
  if (!row?.id) throw new TypeError("Base44 claim id is required");
  const expectedVersion = row.expected_version ?? row.version;
  if (!expectedVersion) throw new TypeError("Base44 claim expected_version or version is required");
  return {
    id: row.id,
    statement: row.statement,
    scope: row.scope,
    evidenceDomain: row.evidence_domain ?? "project",
    expectedVersion,
    reconciliationKey: row.reconciliation_key,
    nextGate: row.next_gate ?? "",
  };
}

export function evidenceFromBase44(row) {
  if (!row?.id) throw new TypeError("Base44 evidence id is required");
  return {
    id: row.id,
    claimId: row.claim_id,
    domain: row.domain ?? "project",
    observedVersion: row.observed_version,
    observedAt: row.observed_at,
    retrievedAt: row.retrieved_at,
    asOf: row.as_of,
    scope: row.scope,
    verificationClass: row.verification_class ?? "manual",
    provider: row.provider,
    reference: row.reference,
  };
}

export function reconcileBase44Claim(claimRow, evidenceRows = [], options = {}) {
  const claim = claimFromBase44(claimRow);
  const evidence = evidenceRows
    .filter((row) => row?.claim_id === claimRow.id)
    .map(evidenceFromBase44);
  return reconcileClaim(claim, evidence, options);
}

export function outcomeToBase44(outcome) {
  const receipt = outcome.receipt;
  const cookie = outcome.continuityCookie;
  return {
    receipt: {
      reconciliation_key: receipt.reconciliationKey,
      claim_id: receipt.claimId,
      subject: receipt.subject,
      expected_version: receipt.expectedVersion,
      observed_version: receipt.observedVersion,
      result: receipt.result,
      truth_state: receipt.truthState,
      evidence_domain: receipt.witness?.domain ?? "none",
      evidence_refs: receipt.evidenceRefs,
      observed_at: receipt.observedAt,
      next_gate: receipt.nextGate,
      authorizing: false,
      witness_provider: receipt.witness?.provider,
      witness_source: receipt.witness?.reference,
      witness_retrieved_at: receipt.witness?.retrievedAt,
      witness_as_of: receipt.witness?.asOf,
      witness_class: receipt.witness?.verificationClass,
      witness_scope: receipt.witness?.scope,
    },
    cookie: {
      reconciliation_key: cookie.reconciliationKey,
      subject: cookie.subject,
      expected_version: cookie.expectedVersion,
      observed_version: cookie.observedVersion,
      evidence_fingerprint: cookie.evidenceFingerprint,
      status: cookie.status,
      invalidation_reason: cookie.invalidationReason,
      observed_at: cookie.observedAt,
      next_gate: cookie.nextGate,
      authorizing: false,
      standing_merge_authority: false,
      approval_carry_forward: false,
    },
  };
}
