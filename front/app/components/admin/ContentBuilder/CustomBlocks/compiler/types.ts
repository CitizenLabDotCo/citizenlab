export interface BlockDiagnostic {
  // 1-indexed line in block.tsx, when known
  line: number | null;
  message: string;
  rule?: string;
}

export interface CompileResult {
  ok: boolean;
  // Compiled ESM with an inline source map. Imports of 'gv-sdk' and the jsx
  // runtime are rewritten to the SDK shim URL.
  code: string | null;
  errors: BlockDiagnostic[];
}
