import test from "node:test";
import assert from "node:assert/strict";
import contract from "../base44/schema-contract.json" with { type: "json" };

test("Living Truth has no public-readable truth-plane entities", () => {
  assert.deepEqual(contract.publicRead, []);
  assert.ok(contract.adminOnlyRead.includes("Evidence"));
  assert.ok(contract.adminOnlyRead.includes("ReconciliationReceipt"));
  assert.ok(contract.adminOnlyRead.includes("ContinuityCookie"));
});
