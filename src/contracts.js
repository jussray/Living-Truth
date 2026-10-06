export const TRUTH_STATES = Object.freeze({
  VERIFIED: "VERIFIED",
  INFERRED: "INFERRED",
  UNKNOWN: "UNKNOWN",
  BLOCKED: "BLOCKED",
  SUPERSEDED: "SUPERSEDED",
});

export const STRICT_SCOPES = new Set(["deployment", "runtime"]);

export const NON_AUTHORIZING_RECEIPT = Object.freeze({
  authorizing: false,
  standingMergeAuthority: false,
  approvalCarryForward: false,
});
