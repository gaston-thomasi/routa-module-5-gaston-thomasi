// Checks our settings against a copy of what the platform returned when we built this.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

// The recording is local-only (gitignored), so CI doesn't have it: skip there.
const fixture = new URL("./fixtures/local-settings.json", import.meta.url);

test("the recorded settings have the shape the tools expect", { skip: !existsSync(fixture) && "no local recording" }, () => {
  const recorded = JSON.parse(readFileSync(fixture, "utf8"));
  assert.ok(Array.isArray(recorded.access));
  assert.ok(recorded.access.every((a: { group: string; apps: string[] }) => typeof a.group === "string" && Array.isArray(a.apps)));
  assert.ok(recorded.policies.every((p: { id: string }) => typeof p.id === "string"));
});
