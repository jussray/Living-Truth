import test from "node:test";
import assert from "node:assert/strict";
import contract from "../base44/schema-contract.json" with { type: "json" };

test("Living Truth has no public-readable truth-plane entities", () => {
  assert.deepEqual(contract.publicRead, []);
  assert.ok(contract.adminOnlyRead.includes("Evidence"));
  assert.ok(contract.adminOnlyRead.includes("ReconciliationReceipt"));
  assert.ok(contract.adminOnlyRead.includes("ContinuityCookie"));
});


test("GitHub ingestion cannot gain repository mutation authority", () => {
  assert.equal(contract.githubIngestion.policy, "observation-only");
  assert.equal(contract.githubIngestion.broadWriteCapableConnectorAllowed, false);
  assert.match(contract.githubIngestion.requiredPermission, /read-only/);
});
