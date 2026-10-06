import ts from "typescript";

import {
  calleeName,
  parseSource,
  positionOf,
  resolveStaticString,
  walk,
} from "./ast.ts";
import type { Diagnostic } from "./types.ts";

const DATA_HOOK = "useReportingData";

export interface ExtractResult {
  queries: string[];
  diagnostics: Diagnostic[];
}

/**
 * Collects the SQL a block runs, so Rails can validate and snapshot the queries
 * without parsing TypeScript.
 *
 * The argument must resolve to a static string. A query assembled at runtime could
 * not be snapshotted (there would be nothing to key the snapshot on) and could not
 * be checked by the sandbox before it ran, so it is rejected rather than tolerated.
 */
export const extractSql = (source: string): ExtractResult => {
  const sourceFile = parseSource(source);
  const queries: string[] = [];
  const diagnostics: Diagnostic[] = [];

  walk(sourceFile, (node) => {
    if (!ts.isCallExpression(node)) return;
    if (calleeName(node) !== DATA_HOOK) return;

    const [first] = node.arguments;
    if (!first) {
      diagnostics.push({
        kind: "lint",
        ...positionOf(node, sourceFile),
        rule: "static-sql",
        message: `${DATA_HOOK}() needs one argument: the SQL to run.`,
      });
      return;
    }

    const sql = resolveStaticString(first, sourceFile);
    if (sql === null) {
      diagnostics.push({
        kind: "lint",
        ...positionOf(first, sourceFile),
        rule: "static-sql",
        message:
          `The argument to ${DATA_HOOK}() must be a static string: a plain string, a ` +
          "template literal with no ${} substitutions, or a const declared in this file " +
          "that holds one. It is extracted at build time and its result is snapshotted, " +
          "so it cannot be assembled while the block runs.",
      });
      return;
    }

    const trimmed = sql.trim();
    if (trimmed.length === 0) {
      diagnostics.push({
        kind: "lint",
        ...positionOf(first, sourceFile),
        rule: "static-sql",
        message: `The SQL passed to ${DATA_HOOK}() is empty.`,
      });
      return;
    }

    if (!queries.includes(trimmed)) queries.push(trimmed);
  });

  return { queries, diagnostics };
};
