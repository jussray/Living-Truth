import test from "node:test";
import assert from "node:assert/strict";
import { outcomeToBase44, reconcileBase44Claim } from "../src/base44-adapter.js";

const observedAt = "2026-10-06T00:31:52.000Z";
const claimRow = {
  id: "c1",
  statement: "main points at abc123",
  scope: "repository",
  evidence_domain: "project",
  expected_version: "abc123",
  reconciliation_key: "repo:main:abc123",
  next_gate: "Re-read main before consequential use.",
};
const evidenceRows = [{
  id: "e1",
  claim_id: "c1",
  domain: "project",
  observed_version: "abc123",
  observed_at: observedAt,
  as_of: observedAt,
  retrieved_at: observedAt,
  scope: "repository",
  verification_class: "authoritative",
  provider: "github",
  reference: "https://api.github.com/repos/example/repo/branches/main",
}];

test("adapts Base44 records into a verified reconciliation", () => {
  const out = reconcileBase44Claim(claimRow, evidenceRows, { observedAt });
  assert.equal(out.truthState, "VERIFIED");
  const persisted = outcomeToBase44(out);
  assert.equal(persisted.receipt.truth_state, "VERIFIED");
  assert.equal(persisted.receipt.authorizing, false);
  assert.equal(persisted.cookie.standing_merge_authority, false);
});

test("does not promote wrong-scope evidence", () => {
  const out = reconcileBase44Claim(
    claimRow,
    [{ ...evidenceRows[0], scope: "runtime" }],
    { observedAt }
  );
  assert.equal(out.truthState, "BLOCKED");
  assert.equal(out.receipt.result, "unverified_witness");
});
