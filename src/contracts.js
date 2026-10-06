export const TRUTH_STATES = Object.freeze({
  VERIFIED: "VERIFIED",
  INFERRED: "INFERRED",
  UNKNOWN: "UNKNOWN",
  BLOCKED: "BLOCKED",
  SUPERSEDED: "SUPERSEDED",
});

export const TRUTH_SCOPES = new Set([
  "component",
  "repository",
  "pull_request",
  "merge",
  "deployment",
  "runtime",
  "external_effect",
  "documentation",
  "market_hypothesis",
]);

export const STRICT_SCOPES = new Set(["deployment", "runtime"]);

export const NON_AUTHORIZING_RECEIPT = Object.freeze({
  authorizing: false,
  standingMergeAuthority: false,
  approvalCarryForward: false,
});
