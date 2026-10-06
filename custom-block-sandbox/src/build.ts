import { compile, esbuildVersion } from "./compile.ts";
import { extractSql } from "./extractSql.ts";
import { lint } from "./lint.ts";
import { typecheck, typescriptVersion } from "./typecheck.ts";
import {
  MAX_DIAGNOSTICS,
  type BuildRequest,
  type BuildResponse,
  type Diagnostic,
} from "./types.ts";

const SDK_VERSION = process.env.SDK_VERSION ?? "v1";

/**
 * Everything static we can say about a block, in one answer.
 *
 * All four steps always run, even when an earlier one failed: the model gets the
 * type error and the forbidden import and the non-static query in a single tool
 * result, and fixes them in one edit instead of four rounds.
 *
 * The extracted queries are put on the manifest but not validated here — Rails runs
 * them through the same SQL sandbox the MCP reporting tool uses, right after this
 * call, and merges the result into the same tool result. One implementation of the
 * sandbox, and still one round trip for the model.
 */
export const build = async (request: BuildRequest): Promise<BuildResponse> => {
  const { source, manifest, messages, locales } = request;

  const compiled = await compile(source);
  const typeDiagnostics = typecheck(source);
  const linted = lint(source, messages ?? {}, locales ?? []);
  const extracted = extractSql(source);

  const diagnostics: Diagnostic[] = [
    ...compiled.diagnostics,
    ...typeDiagnostics,
    ...linted.diagnostics,
    ...extracted.diagnostics,
  ];

  const blocking = diagnostics.filter(
    (diagnostic) => diagnostic.kind !== "compile"
  );
  const ok = compiled.code !== null && blocking.length === 0;

  return {
    ok,
    bundle: ok ? compiled.code : null,
    manifest: { ...manifest, queries: extracted.queries },
    diagnostics: diagnostics.slice(0, MAX_DIAGNOSTICS),
    toolchain: {
      esbuild: esbuildVersion,
      typescript: typescriptVersion,
      sdk: SDK_VERSION,
    },
  };
};
