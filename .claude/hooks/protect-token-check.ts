// PreToolUse hook: refuses any change to mcp/src/token-check.ts.
// Exit 2 blocks the tool call and shows stderr to Claude.
import { resolve } from "node:path";

const PROTECTED = "mcp/src/token-check.ts";
const NAME = "token-check.ts";

// Commands that write, move, delete or rewrite files, or hand the file to an interpreter.
const WRITERS = [
  /(^|[\s;&|(])(tee|truncate|install|dd|ln|rm|mv|cp|ed|ex|patch|rsync|shred|unlink)(\s|$)/,
  /\b(sed|perl|ruby)\b[^|;&]*\s-[a-zA-Z]*i/,
  /\bgit\s+(checkout|restore|reset|stash|apply|am|rm|mv|clean|revert|cherry-pick|merge|rebase|switch|pull)\b/,
  /(^|[\s;&|(])(node|python3?|ruby|perl|deno|bun|sh|bash|zsh|awk|npx|tsx)(\s|$)/,
  /(^|[^<\d])>>?\s*\S*/, // any output redirection in a segment that mentions the file
];

function block(why: string): never {
  console.error(`Blocked: ${PROTECTED} is protected. ${why} Ask the user to change it themselves.`);
  process.exit(2);
}

function isProtectedPath(p: unknown, cwd: string): boolean {
  if (typeof p !== "string" || p === "") return false;
  return resolve(cwd, p).endsWith("/" + PROTECTED);
}

function checkBash(command: string): void {
  // Split into simple commands; only the ones that mention the file matter.
  const segments = command.split(/\n|;|&&|\|\||\|/);
  for (const seg of segments) {
    if (!seg.includes(NAME)) continue;
    if (WRITERS.some((re) => re.test(seg))) block("That shell command could write to it.");
  }
}

let raw = "";
for await (const chunk of process.stdin) raw += chunk;
const input = JSON.parse(raw);
const cwd: string = input.cwd ?? process.cwd();
const tool: string = input.tool_name ?? "";
const args = input.tool_input ?? {};

if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool)) {
  if (isProtectedPath(args.file_path ?? args.notebook_path, cwd)) block("File edits are not allowed.");
} else if (tool === "Bash" && typeof args.command === "string") {
  checkBash(args.command);
}
