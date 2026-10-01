import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import ts from "typescript";

import { BLOCK_FILE_NAME } from "./ast.ts";
import type { Diagnostic } from "./types.ts";

/**
 * The SDK type definitions. Their single source is
 * `front/app/components/admin/ContentBuilder/CustomBlocks/sdk/v1/gv-sdk.d.ts`;
 * the image copies it in and docker-compose bind-mounts it.
 */
const SDK_TYPES_PATH =
  process.env.SDK_TYPES_PATH ?? path.join(process.cwd(), "sdk", "gv-sdk.d.ts");

/**
 * Enough of a JSX namespace to typecheck TSX without pulling in React's own types.
 * esbuild does the actual transform, so `jsx: preserve` here keeps the type checker
 * from needing a jsx-runtime module on disk.
 */
const JSX_SHIM = `
declare namespace JSX {
  type Element = unknown;
  type ElementType = unknown;
  interface ElementAttributesProperty { props: unknown }
  interface ElementChildrenAttribute { children: unknown }
  interface IntrinsicElements { [name: string]: unknown }
  interface IntrinsicAttributes { key?: string | number }
}
`;

const TSCONFIG = {
  compilerOptions: {
    target: "es2020",
    module: "esnext",
    moduleResolution: "bundler",
    jsx: "preserve",
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    // The block is one self-contained module; there is no ambient DOM or Node
    // surface it is allowed to reach.
    types: [] as string[],
    lib: ["es2020"],
  },
  files: [BLOCK_FILE_NAME, "gv-sdk.d.ts", "jsx.d.ts"],
};

let cachedSdkTypes: string | null = null;

export const sdkTypes = (): string => {
  cachedSdkTypes ??= fs.readFileSync(SDK_TYPES_PATH, "utf-8");
  return cachedSdkTypes;
};

/**
 * Typechecks the block against the SDK declarations.
 *
 * The plan calls for `tsgo` (`@typescript/native-preview`) here for speed. This uses
 * the `typescript` package's own API instead: it is the package the lint already
 * needs, it hands back structured diagnostics with exact positions rather than text
 * to re-parse, and it removes a native binary from the container's critical path.
 * Swapping in tsgo later is a change to this one function.
 */
export const typecheck = (source: string): Diagnostic[] => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gv-block-"));

  try {
    fs.writeFileSync(path.join(dir, BLOCK_FILE_NAME), source, "utf-8");
    fs.writeFileSync(path.join(dir, "gv-sdk.d.ts"), sdkTypes(), "utf-8");
    fs.writeFileSync(path.join(dir, "jsx.d.ts"), JSX_SHIM, "utf-8");
    fs.writeFileSync(
      path.join(dir, "tsconfig.json"),
      JSON.stringify(TSCONFIG, null, 2),
      "utf-8"
    );

    const configPath = path.join(dir, "tsconfig.json");
    const parsed = ts.getParsedCommandLineOfConfigFile(configPath, {}, {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: () => undefined,
    } as ts.ParseConfigFileHost);

    if (!parsed) {
      return [
        {
          kind: "type",
          line: null,
          column: null,
          message: "The type checker could not be configured.",
        },
      ];
    }

    const program = ts.createProgram(parsed.fileNames, parsed.options);
    const blockFile = program
      .getSourceFiles()
      .find((file) => file.fileName.endsWith(BLOCK_FILE_NAME));

    return [
      ...program.getSyntacticDiagnostics(blockFile),
      ...program.getSemanticDiagnostics(blockFile),
    ].map((diagnostic) => toDiagnostic(diagnostic));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

const toDiagnostic = (diagnostic: ts.Diagnostic): Diagnostic => {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, " ");

  if (diagnostic.file && diagnostic.start !== undefined) {
    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
      diagnostic.start
    );
    return { kind: "type", line: line + 1, column: character + 1, message };
  }

  return { kind: "type", line: null, column: null, message };
};

export const typescriptVersion = ts.version;
