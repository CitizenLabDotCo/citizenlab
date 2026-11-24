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

// --- Rendering ---

/** What the harness is asked to mount. */
export type RenderTarget =
  | {
      kind: "block";
      bundle: string;
      manifest: Record<string, unknown>;
      messages: MessageCatalogues;
      config: Record<string, unknown>;
    }
  | { kind: "layout"; craftjs_json: Record<string, unknown>; rootId?: string };

export interface RenderRequest {
  target: RenderTarget;
  locale: string;
  layoutId: string;
  /** Origin of the SPA that serves the harness route. */
  appOrigin: string;
  /** Origin of the API the page fetches data and uploads from, when it differs. */
  apiOrigin?: string;
  /** Short-lived, scoped to reading this layout's reporting data. */
  token: string;
  screenshot?: boolean;
}

/** A box the harness measured, in CSS pixels. */
export interface MeasuredBox {
  nodeId: string | null;
  width: number;
  height: number;
  /** Rendered data elements inside a chart wrapper (`path`, `rect`). */
  dataElements?: number;
}

/** What the page reports. The page collects; the service decides what it means. */
export interface HarnessFacts {
  mounted: boolean;
  boundaryError: { message: string; stack?: string } | null;
  metrics: {
    root: { width: number; height: number };
    charts: MeasuredBox[];
    boxes: MeasuredBox[];
  };
  a11y: { violations: { id: string; impact: string | null; help: string }[] };
}

/** What Playwright saw from outside the page, which the page cannot fake. */
export interface BrowserFacts {
  console: string[];
  /** Console warnings. Reported for context; they never fail a check. */
  warnings: string[];
  pageErrors: string[];
  failedRequests: { url: string; reason: string }[];
}

export interface Check {
  id: string;
  ok: boolean;
  message: string;
}

export interface RenderResponse {
  mounted: boolean;
  errors: string[];
  console: string[];
  warnings: string[];
  failedRequests: { url: string; reason: string }[];
  metrics: HarnessFacts["metrics"] | null;
  a11y: HarnessFacts["a11y"] | null;
  checks: Check[];
  /** base64 PNG of the harness root, when one was asked for or a check failed. */
  screenshot: string | null;
  /** The report was taller than a picture may be, and the screenshot shows its top. */
  screenshotClipped: boolean;
}

/**
 * The most of a page a screenshot shows, in CSS pixels. A model provider refuses an
 * image over 8000 px on a side, and a whole report at the A4 content width runs to
 * many thousands; the top of it is what a layout question is usually about.
 */
export const MAX_SCREENSHOT_HEIGHT_PX = 6000;

/** A page that will not settle is killed and reported rather than held open. */
export const RENDER_TIMEOUT_MS = 30_000;

/** Console lines are deduped and capped so one noisy block cannot flood a transcript. */
export const MAX_CONSOLE_LINES = 20;

/** Below this a block is a gap on the page rather than content. */
export const MIN_BLOCK_HEIGHT_PX = 24;
