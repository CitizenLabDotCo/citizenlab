/** Where a diagnostic came from. The model uses this to decide what to fix. */
export type DiagnosticKind = "compile" | "type" | "lint" | "message" | "sql";

export interface Diagnostic {
  kind: DiagnosticKind;
  /** 1-indexed line in block.tsx, when the step knows one. */
  line: number | null;
  column: number | null;
  message: string;
  /** The lint rule that fired, for lint diagnostics. */
  rule?: string;
}

/** locale -> message key -> text */
export type MessageCatalogues = Record<string, Record<string, string>>;

export interface BuildRequest {
  source: string;
  manifest: Record<string, unknown>;
  messages: MessageCatalogues;
  /** The tenant's locales. Every one of them needs a catalogue. */
  locales: string[];
}

export interface Toolchain {
  esbuild: string;
  typescript: string;
  sdk: string;
}

export interface BuildResponse {
  ok: boolean;
  /** Compiled ESM with an inline source map. Null when the build failed. */
  bundle: string | null;
  /** The request's manifest with `queries` filled in from the source. */
  manifest: Record<string, unknown>;
  diagnostics: Diagnostic[];
  toolchain: Toolchain;
}

/** Diagnostics are capped so one broken build cannot flood the transcript. */
export const MAX_DIAGNOSTICS = 30;
