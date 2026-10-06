import { createHash } from "node:crypto";
import { NON_AUTHORIZING_RECEIPT, STRICT_SCOPES, TRUTH_STATES } from "./contracts.js";

export function fingerprint(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function required(value, name) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${name} is required`);
  }
  return value.trim();
}

function timestamp(value) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function newest(evidence) {
  return [...evidence].sort((a, b) => {
    const aTime = timestamp(a.asOf ?? a.observedAt ?? a.retrievedAt);
    const bTime = timestamp(b.asOf ?? b.observedAt ?? b.retrievedAt);
    return (Number.isFinite(bTime) ? bTime : -Infinity) - (Number.isFinite(aTime) ? aTime : -Infinity);
  })[0];
}

export function reconcileClaim(claim, allEvidence, options = {}) {
  const observedAt = options.observedAt ?? new Date().toISOString();
  const maxAgeMs = options.maxAgeMs ?? 24 * 60 * 60 * 1000;

  const id = required(claim?.id, "claim.id");
  const statement = required(claim?.statement, "claim.statement");
  const scope = required(claim?.scope, "claim.scope");
  const evidenceDomain = required(claim?.evidenceDomain, "claim.evidenceDomain");
  const expectedVersion = required(claim?.expectedVersion, "claim.expectedVersion");
  const reconciliationKey = required(claim?.reconciliationKey, "claim.reconciliationKey");

  const mine = (allEvidence ?? []).filter((item) => item?.claimId === id);
  const sameDomain = mine.filter((item) => item?.domain === evidenceDomain);
  const strict = STRICT_SCOPES.has(scope);
  const base = {
    claimId: id,
    subject: statement,
    scope,
    reconciliationKey,
    expectedVersion,
    observedAt,
    nextGate: claim.nextGate ?? "",
    ...NON_AUTHORIZING_RECEIPT,
  };

  if (evidenceDomain === "project" && sameDomain.length === 0 && mine.some((item) => item?.domain === "world")) {
    return makeOutcome(base, {
      result: "scope_separation_violation",
      truthState: strict ? TRUTH_STATES.BLOCKED : TRUTH_STATES.UNKNOWN,
      reason: "World evidence cannot verify project truth.",
      evidence: null,
    });
  }

  if (sameDomain.length === 0) {
    return makeOutcome(base, {
      result: "missing_evidence",
      truthState: strict ? TRUTH_STATES.BLOCKED : TRUTH_STATES.UNKNOWN,
      reason: strict
        ? `${scope} claims require direct in-scope evidence.`
        : "No matching evidence has been observed.",
      evidence: null,
    });
  }

  const certifying = sameDomain.filter(
    (item) => item?.verificationClass === "authoritative" && item?.scope === scope
  );

  if (certifying.length === 0) {
    return makeOutcome(base, {
      result: "unverified_witness",
      truthState: TRUTH_STATES.BLOCKED,
      reason: "No authoritative in-scope witness can certify this claim.",
      evidence: newest(sameDomain),
    });
  }

  const witness = newest(certifying);
  const witnessTime = timestamp(witness.asOf ?? witness.observedAt ?? witness.retrievedAt);
  const now = timestamp(observedAt);
  if (!Number.isFinite(witnessTime) || !Number.isFinite(now) || witnessTime > now || now - witnessTime > maxAgeMs) {
    return makeOutcome(base, {
      result: "stale_evidence",
      truthState: TRUTH_STATES.BLOCKED,
      reason: "The newest certifying witness is stale or has an invalid observation time.",
      evidence: witness,
    });
  }

  const tiedWitnesses = certifying.filter((item) => {
    const itemTime = timestamp(item.asOf ?? item.observedAt ?? item.retrievedAt);
    return itemTime === witnessTime;
  });
  const tiedVersions = [...new Set(tiedWitnesses.map((item) => item?.observedVersion ?? ""))];
  if (tiedVersions.length > 1) {
    return makeOutcome(base, {
      result: "conflicting_evidence",
      truthState: TRUTH_STATES.BLOCKED,
      reason: "Equally current authoritative in-scope witnesses disagree.",
      evidence: witness,
      evidenceRefs: tiedWitnesses.map((item) => item?.reference).filter(Boolean),
      observedVersion: "",
    });
  }

  if (witness.observedVersion !== expectedVersion) {
    return makeOutcome(base, {
      result: "exact_version_mismatch",
      truthState: TRUTH_STATES.BLOCKED,
      reason: `Expected ${expectedVersion}; observed ${witness.observedVersion ?? "nothing"}.`,
      evidence: witness,
    });
  }

  return makeOutcome(base, {
    result: "match",
    truthState: TRUTH_STATES.VERIFIED,
    reason: "Authoritative in-scope evidence matches the expected version.",
    evidence: witness,
  });
}

function makeOutcome(base, finding) {
  const evidenceRefs = finding.evidenceRefs
    ?? (finding.evidence?.reference ? [finding.evidence.reference] : []);
  const observedVersion = finding.observedVersion ?? finding.evidence?.observedVersion ?? "";
  const evidenceFingerprint = fingerprint({
    reconciliationKey: base.reconciliationKey,
    expectedVersion: base.expectedVersion,
    observedVersion,
    result: finding.result,
    evidenceRefs,
    observedAt: base.observedAt,
  });

  const receipt = {
    id: `RCP-${evidenceFingerprint.slice(0, 16)}`,
    ...base,
    result: finding.result,
    truthState: finding.truthState,
    reason: finding.reason,
    observedVersion,
    evidenceRefs,
    witness: finding.evidence
      ? {
          id: finding.evidence.id,
          provider: finding.evidence.provider ?? "manual",
          reference: finding.evidence.reference ?? "",
          retrievedAt: finding.evidence.retrievedAt ?? finding.evidence.observedAt ?? "",
          asOf: finding.evidence.asOf ?? finding.evidence.observedAt ?? "",
          verificationClass: finding.evidence.verificationClass ?? "manual",
          scope: finding.evidence.scope ?? "",
          domain: finding.evidence.domain ?? "",
        }
      : null,
  };

  const continuityCookie = {
    id: `CKE-${evidenceFingerprint.slice(0, 16)}`,
    reconciliationKey: base.reconciliationKey,
    subject: base.subject,
    expectedVersion: base.expectedVersion,
    observedVersion,
    evidenceFingerprint,
    status: finding.truthState === TRUTH_STATES.VERIFIED ? "current" : "blocked",
    invalidationReason: finding.truthState === TRUTH_STATES.VERIFIED ? "" : finding.reason,
    observedAt: base.observedAt,
    nextGate: base.nextGate,
    ...NON_AUTHORIZING_RECEIPT,
  };

  return { truthState: finding.truthState, receipt, continuityCookie };
}
