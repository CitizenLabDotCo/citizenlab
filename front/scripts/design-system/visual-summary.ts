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
  // Diffs that exceeded the budget once and were re-run.
  retried: number;
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

/**
 * Story ids matching `--stories`: comma separated globs where `*` is any
 * run of characters, matched against the whole id. No filter keeps all.
 */
export const matchStories = (ids: string[], globs?: string): string[] => {
  if (globs === undefined) return ids;
  const res = globs
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean)
    .map(
      (g) =>
        new RegExp(
          `^${g
            .split('*')
            .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
            .join('.*')}$`
        )
    );
  return ids.filter((id) => res.some((re) => re.test(id)));
};

/** Screenshot file of one story at one viewport. */
export const shotName = (viewport: string, id: string) =>
  `${viewport}__${id}.png`;

export const parseArgs = (argv: string[]) => {
  const out = {
    baseline: undefined as string | undefined,
    compare: undefined as string | undefined,
    url: 'http://localhost:6006',
    allowPx: 0,
    summary: undefined as string | undefined,
    stories: undefined as string | undefined,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`Missing value for ${a}`);
      return v;
    };
    if (a === '--baseline') out.baseline = next();
    else if (a === '--compare') out.compare = next();
    else if (a === '--url') out.url = next() as string;
    else if (a === '--allow-px') out.allowPx = Number(next());
    else if (a === '--summary') out.summary = next();
    else if (a === '--stories') out.stories = next();
    else throw new Error(`Unknown argument: ${a}`);
  }
  if (!Number.isFinite(out.allowPx) || out.allowPx < 0) {
    throw new Error('--allow-px must be a non-negative number');
  }
  if (!!out.baseline === !!out.compare) {
    throw new Error('Pass exactly one of --baseline <dir> or --compare <dir>');
  }
  return out;
};

// includeAA must stay true: rounded corners are almost entirely anti-aliased
// pixels, and the default (false) ignores them, hiding radius changes.
// threshold 0: any colour change counts. The default 0.1 hid low contrast
// changes, such as a white panel's corner on the light grey canvas.
export const PIXELMATCH_OPTIONS = { threshold: 0, includeAA: true };

export const isDiff = (px: number, allowPx: number) => px > allowPx;

// Render phases of the Storybook preview (`__STORYBOOK_PREVIEW__.currentRender
// .phase`) after which nothing more happens to the story: rendered and its
// play function done, or stopped. A screenshot taken before one of these can
// miss what the play step or a late data fetch puts on screen.
export const SETTLED_PHASES = ['finished', 'errored', 'aborted'];

// Channel event the preview emits when a story's play function throws. The
// render still goes on to `finished`, so the phase alone does not show it.
export const PLAY_ERROR_EVENT = 'playFunctionThrewException';

export const buildSummary = (
  stories: number,
  results: { id: string; viewport: string; px?: number; error?: string }[],
  allowPx: number,
  retried = 0,
  now: Date = new Date()
): Summary => ({
  stories,
  diffs: results
    .filter((r) => r.error === undefined && isDiff(r.px ?? 0, allowPx))
    .map((r) => ({ id: r.id, viewport: r.viewport, px: r.px as number })),
  errors: results
    .filter((r) => r.error !== undefined)
    .map((r) => ({
      id: r.id,
      viewport: r.viewport,
      message: r.error as string,
    })),
  retried,
  generatedAt: now.toISOString(),
});
