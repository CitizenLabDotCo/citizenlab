// Pure logic for the visual run: no browser, no image libraries.

export type Viewport = { name: string; width: number; height: number };

export const VIEWPORTS: Viewport[] = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

export type Diff = { id: string; viewport: string; px: number };
export type RunError = { id: string; viewport: string; message: string };

export type Summary = {
  stories: number;
  diffs: Diff[];
  // Stories that could not be captured or compared (render error, empty
  // root, missing baseline, size change). Not part of the original schema.
  errors: RunError[];
  generatedAt: string;
};

type IndexEntry = { id: string; type?: string };

export const storyIdsFromIndex = (index: {
  entries?: Record<string, IndexEntry>;
}): string[] =>
  Object.values(index.entries ?? {})
    .filter((e) => e.type === 'story')
    .map((e) => e.id)
    .sort();

export const parseArgs = (argv: string[]) => {
  const out = {
    baseline: undefined as string | undefined,
    compare: undefined as string | undefined,
    url: 'http://localhost:6006',
    allowPx: 0,
    summary: undefined as string | undefined,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--baseline') out.baseline = next();
    else if (a === '--compare') out.compare = next();
    else if (a === '--url') out.url = next() as string;
    else if (a === '--allow-px') out.allowPx = Number(next());
    else if (a === '--summary') out.summary = next();
  }
  if (!Number.isFinite(out.allowPx) || out.allowPx < 0) {
    throw new Error('--allow-px must be a non-negative number');
  }
  if (!!out.baseline === !!out.compare) {
    throw new Error('Pass exactly one of --baseline <dir> or --compare <dir>');
  }
  return out;
};

export const isDiff = (px: number, allowPx: number) => px > allowPx;

export const buildSummary = (
  stories: number,
  results: { id: string; viewport: string; px?: number; error?: string }[],
  allowPx: number,
  now: Date = new Date()
): Summary => ({
  stories,
  diffs: results
    .filter((r) => r.error === undefined && isDiff(r.px ?? 0, allowPx))
    .map((r) => ({ id: r.id, viewport: r.viewport, px: r.px as number })),
  errors: results
    .filter((r) => r.error !== undefined)
    .map((r) => ({ id: r.id, viewport: r.viewport, message: r.error as string })),
  generatedAt: now.toISOString(),
});
