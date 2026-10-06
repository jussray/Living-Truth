import test from "node:test";
import assert from "node:assert/strict";
import { reconcileClaim } from "../src/truth-core.js";

const now = "2026-10-06T00:31:52.000Z";
const claim = {
  id: "c1",
  statement: "main points at abc123",
  scope: "repository",
  evidenceDomain: "project",
  expectedVersion: "abc123",
  reconciliationKey: "repo:main:abc123",
  nextGate: "Re-read main before consequential use.",
};
const evidence = {
  id: "e1",
  claimId: "c1",
  domain: "project",
  observedVersion: "abc123",
  observedAt: now,
  asOf: now,
  retrievedAt: now,
  scope: "repository",
  verificationClass: "authoritative",
  provider: "github",
  reference: "https://api.github.com/repos/example/repo/branches/main",
};

test("verifies an exact authoritative in-scope witness", () => {
  const out = reconcileClaim(claim, [evidence], { observedAt: now });
  assert.equal(out.truthState, "VERIFIED");
  assert.equal(out.receipt.result, "match");
  assert.equal(out.receipt.authorizing, false);
  assert.equal(out.continuityCookie.approvalCarryForward, false);
});

test("blocks exact-version mismatch", () => {
  const out = reconcileClaim(claim, [{ ...evidence, observedVersion: "def456" }], { observedAt: now });
  assert.equal(out.truthState, "BLOCKED");
  assert.equal(out.receipt.result, "exact_version_mismatch");
});

test("world evidence cannot verify project truth", () => {
  const out = reconcileClaim(claim, [{ ...evidence, domain: "world" }], { observedAt: now });
  assert.equal(out.truthState, "UNKNOWN");
  assert.equal(out.receipt.result, "scope_separation_violation");
});

test("runtime claims fail closed without runtime evidence", () => {
  const runtimeClaim = { ...claim, scope: "runtime", reconciliationKey: "runtime:abc123" };
  const out = reconcileClaim(runtimeClaim, [], { observedAt: now });
  assert.equal(out.truthState, "BLOCKED");
  assert.equal(out.receipt.result, "missing_evidence");
});


test("newer manual evidence cannot displace authoritative in-scope proof", () => {
  const later = "2026-10-06T00:31:53.000Z";
  const out = reconcileClaim(
    claim,
    [
      evidence,
      {
        ...evidence,
        id: "e-manual",
        observedVersion: "wrong-manual-value",
        observedAt: later,
        asOf: later,
        retrievedAt: later,
        verificationClass: "manual",
        reference: "manual://observation",
      },
    ],
    { observedAt: later }
  );
  assert.equal(out.truthState, "VERIFIED");
  assert.equal(out.receipt.result, "match");
  assert.equal(out.receipt.witness.id, "e1");
});

test("wrong-scope evidence cannot displace authoritative in-scope proof", () => {
  const later = "2026-10-06T00:31:53.000Z";
  const out = reconcileClaim(
    claim,
    [
      evidence,
      {
        ...evidence,
        id: "e-runtime",
        observedVersion: "runtime-value",
        observedAt: later,
        asOf: later,
        retrievedAt: later,
        scope: "runtime",
        reference: "runtime://observation",
      },
    ],
    { observedAt: later }
  );
  assert.equal(out.truthState, "VERIFIED");
  assert.equal(out.receipt.witness.id, "e1");
});

test("equally current authoritative in-scope witnesses that disagree are blocked distinctly", () => {
  const out = reconcileClaim(
    claim,
    [
      evidence,
      {
        ...evidence,
        id: "e2",
        observedVersion: "def456",
        reference: "https://api.github.com/repos/example/repo/branches/main?mirror=2",
      },
    ],
    { observedAt: now }
  );
  assert.equal(out.truthState, "BLOCKED");
  assert.equal(out.receipt.result, "conflicting_evidence");
  assert.equal(out.receipt.evidenceRefs.length, 2);
});
