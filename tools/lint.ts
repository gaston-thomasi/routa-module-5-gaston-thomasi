// Gate: every tool that calls patchSettings must also call showChange,
// so a change is shown before it is applied. apply-change.ts is exempt:
// it applies a change that preview-change already showed.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "mcp/src/tools";
const EXEMPT = new Set(["apply-change.ts"]);

// Drop comments so a mention in one doesn't count as a call.
const code = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const calls = (src: string, name: string) => new RegExp(`\\b${name}\\s*\\(`).test(src);

const failures: string[] = [];
for (const file of readdirSync(DIR).filter((f) => f.endsWith(".ts")).sort()) {
  if (EXEMPT.has(file)) continue;
  const src = code(readFileSync(join(DIR, file), "utf8"));
  if (calls(src, "patchSettings") && !calls(src, "showChange")) {
    failures.push(`${join(DIR, file)}: calls patchSettings without calling showChange`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  console.error("Every change must be shown before it is applied.");
  process.exit(1);
}
console.log("lint: ok");
