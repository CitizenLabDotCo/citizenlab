import * as esbuild from "esbuild";

import type { Diagnostic } from "./types.ts";

/**
 * Where the browser resolves the SDK. A compiled bundle keeps `gv-sdk` as an
 * external import rewritten to this URL, so every block shares the app's React
 * instance instead of carrying its own copy.
 */
export const SDK_SHIM_URL = "/custom-block-sdk/v1.js";

const SDK_SPECIFIERS = /^(gv-sdk|react\/jsx-(dev-)?runtime)$/;

const sdkExternalPlugin: esbuild.Plugin = {
  name: "gv-sdk-external",
  setup(build) {
    build.onResolve({ filter: SDK_SPECIFIERS }, () => ({
      path: SDK_SHIM_URL,
      external: true,
    }));

    // Anything else is a hard failure rather than a bundled copy: a block that
    // reaches outside the SDK is a block we cannot reason about or upgrade.
    build.onResolve({ filter: /.*/ }, (args) => {
      if (args.kind === "entry-point") return null;
      return {
        errors: [
          {
            text: `Cannot import '${args.path}'. A block may only import from 'gv-sdk'.`,
          },
        ],
      };
    });
  },
};

const toDiagnostics = (messages: esbuild.Message[]): Diagnostic[] =>
  messages.map((message) => ({
    kind: "compile" as const,
    line: message.location?.line ?? null,
    column: message.location?.column ?? null,
    message: message.location?.lineText
      ? `${message.text} (${message.location.lineText.trim()})`
      : message.text,
  }));

export interface CompileResult {
  code: string | null;
  diagnostics: Diagnostic[];
}

export const compile = async (source: string): Promise<CompileResult> => {
  try {
    const result = await esbuild.build({
      stdin: { contents: source, loader: "tsx", sourcefile: "block.tsx" },
      bundle: true,
      write: false,
      format: "esm",
      target: "es2020",
      jsx: "automatic",
      // Inline, so a runtime stack trace in the harness maps back to the line
      // the model wrote.
      sourcemap: "inline",
      logLevel: "silent",
      plugins: [sdkExternalPlugin],
    });

    return {
      code: result.outputFiles[0]?.text ?? null,
      diagnostics: toDiagnostics(result.warnings),
    };
  } catch (error) {
    const failure = error as Partial<esbuild.BuildFailure>;
    return {
      code: null,
      diagnostics: failure.errors?.length
        ? toDiagnostics(failure.errors)
        : [
            {
              kind: "compile",
              line: null,
              column: null,
              message: String(error),
            },
          ],
    };
  }
};

export const esbuildVersion = esbuild.version;
