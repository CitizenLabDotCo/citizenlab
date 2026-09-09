import * as esbuild from 'esbuild-wasm';
import wasmURL from 'esbuild-wasm/esbuild.wasm?url';

import { SDK_SHIM_URL } from '../runtime/sdkContract';

import { BlockDiagnostic, CompileResult } from './types';

interface CompileRequest {
  id: number;
  source: string;
}

let initialized: Promise<void> | null = null;

const ensureInitialized = () => {
  initialized =
    initialized ?? esbuild.initialize({ wasmURL, worker: false });
  return initialized;
};

// Rewrites the SDK and jsx-runtime imports to the shim served by the app, and
// leaves them external so the browser resolves them at import time.
const sdkExternalPlugin: esbuild.Plugin = {
  name: 'gv-sdk-external',
  setup(build) {
    build.onResolve({ filter: /^(gv-sdk|react\/jsx-(dev-)?runtime)$/ }, () => ({
      path: SDK_SHIM_URL,
      external: true,
    }));
  },
};

const toDiagnostics = (messages: esbuild.Message[]): BlockDiagnostic[] =>
  messages.map((message) => ({
    line: message.location?.line ?? null,
    message: message.location?.lineText
      ? `${message.text} (${message.location.lineText.trim()})`
      : message.text,
  }));

const compile = async (source: string): Promise<CompileResult> => {
  await ensureInitialized();

  try {
    const result = await esbuild.build({
      stdin: {
        contents: source,
        loader: 'tsx',
        sourcefile: 'block.tsx',
      },
      bundle: true,
      write: false,
      format: 'esm',
      target: 'es2020',
      jsx: 'automatic',
      sourcemap: 'inline',
      logLevel: 'silent',
      plugins: [sdkExternalPlugin],
    });

    return {
      ok: true,
      code: result.outputFiles[0].text,
      errors: toDiagnostics(result.warnings),
    };
  } catch (error) {
    const errors = (error as Partial<esbuild.BuildFailure>).errors;
    return {
      ok: false,
      code: null,
      errors: errors
        ? toDiagnostics(errors)
        : [{ line: null, message: String(error) }],
    };
  }
};

self.onmessage = async (event: MessageEvent<CompileRequest>) => {
  const { id, source } = event.data;
  const result = await compile(source);
  self.postMessage({ id, result });
};
