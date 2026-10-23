// The parts of Storybook's preview (10.4) the shell talks to inside a canvas
// frame. Same origin, so the frame's window is reachable:
//
// - `__STORYBOOK_PREVIEW__.currentRender.story` is the prepared story: `id`,
//   `argTypes`, `initialArgs`. There is no `storyStore` property; the store
//   is `storyStoreValue`, and `storyStoreValue.args.get(id)` holds the
//   current args.
// - `__STORYBOOK_ADDONS_CHANNEL__` carries `updateStoryArgs`,
//   `resetStoryArgs`, `setCurrentStory` and `forceRemount` in, and
//   `storyPrepared`, `storyArgsUpdated` and `storyRendered` (with the story
//   id) out. `currentRender.id` is the story being rendered, set as soon as
//   a switch starts.
//
// An args update reaches the store but the story does not re-render: the
// MemoryRouter decorator (app/utils/router.tsx) reads its children through
// a ref inside a memoised router. So every update is followed by
// `forceRemount`, which renders the story again with the stored args. An
// update waits while the canvas switches the frame (holdFrame), queued per
// frame document and merged, so a drag sends its last value.

export type ArgType = {
  name?: string;
  description?: string;
  options?: unknown[];
  control?: { type?: string; options?: unknown[] } | string | false;
  type?: { name?: string; value?: unknown };
  table?: { disable?: boolean };
};

export type PreparedStory = {
  id: string;
  argTypes: Record<string, ArgType>;
  args: Record<string, unknown>;
};

export type Channel = {
  on: (event: string, fn: (payload: any) => void) => void;
  off: (event: string, fn: (payload: any) => void) => void;
  once?: (event: string, fn: (payload: any) => void) => void;
  emit: (event: string, payload: unknown) => void;
};

type PreviewWindow = Window & {
  __STORYBOOK_PREVIEW__?: {
    currentRender?: {
      id?: string;
      phase?: string;
      story?: {
        id: string;
        argTypes?: Record<string, ArgType>;
        initialArgs?: Record<string, unknown>;
        storyGlobals?: Record<string, unknown>;
      };
    };
    storyStoreValue?: {
      args?: { get: (id: string) => Record<string, unknown> | undefined };
      userGlobals?: {
        get: () => Record<string, unknown>;
        update: (globals: Record<string, unknown>) => void;
      };
    };
  };
  __STORYBOOK_ADDONS_CHANNEL__?: Channel;
};

const previewOf = (win: Window | null | undefined) =>
  (win as PreviewWindow | null | undefined)?.__STORYBOOK_PREVIEW__;

export const channelOf = (win: Window | null | undefined) =>
  (win as PreviewWindow | null | undefined)?.__STORYBOOK_ADDONS_CHANNEL__;

// Sets user globals in the frame's store, for the next render to see; false
// when the store is not reachable (yet) or did not take them all (it drops
// names the preview does not declare).
export const setUserGlobals = (
  win: Window | null | undefined,
  globals: Record<string, unknown>
): boolean => {
  try {
    const store = (win as PreviewWindow | null | undefined)
      ?.__STORYBOOK_PREVIEW__?.storyStoreValue?.userGlobals;
    if (!store) return false;
    store.update(globals);
    const now = store.get();
    return Object.keys(globals).every((k) => now[k] === globals[k]);
  } catch {
    return false;
  }
};

// Whether the frame's story has finished rendering; with `storyId`, only
// when that is the story (the canvas switches stories in the same frame).
export const isRendered = (
  win: Window | null | undefined,
  storyId?: string
) => {
  try {
    const render = (win as PreviewWindow | null | undefined)
      ?.__STORYBOOK_PREVIEW__?.currentRender;
    return (
      render?.phase === 'finished' &&
      (storyId === undefined || render.id === storyId)
    );
  } catch {
    return false;
  }
};

// The story the frame shows, or null while it is still being prepared.
export const readStory = (
  win: Window | null | undefined
): PreparedStory | null => {
  try {
    const preview = (win as PreviewWindow | null | undefined)
      ?.__STORYBOOK_PREVIEW__;
    const story = preview?.currentRender?.story;
    if (!story) return null;
    return {
      id: story.id,
      argTypes: story.argTypes ?? {},
      args: {
        ...(preview?.storyStoreValue?.args?.get(story.id) ??
          story.initialArgs ??
          {}),
      },
    };
  } catch {
    // The frame navigated away (or to another origin) mid-read.
    return null;
  }
};

// The language the frame's story sets for itself (`globals: { lang }` in
// the story), or undefined.
export const storyLangOf = (win: Window | null | undefined) => {
  try {
    const lang = (win as PreviewWindow | null | undefined)
      ?.__STORYBOOK_PREVIEW__?.currentRender?.story?.storyGlobals?.lang;
    return typeof lang === 'string' ? lang : undefined;
  } catch {
    return undefined;
  }
};

// Phases of a story render past its loaders, render and play function:
// tearing it down then does not reload the frame (StoryRender.isPending).
// `completing` waits for the story's CSS animations, at least 100 ms.
const SETTLED = new Set(['played', 'completing', 'completed', 'finished']);
// A remount renders the same StoryRender again, and the pass it aborts
// still writes its later phases onto it: only remount a pass that is done.
// `completed` still has the afterEach hooks to run, but a teardown waits a
// few ticks for them before it reloads, and the one hook the preview has
// (a11y) returns at once in the workbench, where its checks are manual.
const SETTLED_FOR_REMOUNT = new Set(['completed', 'finished']);

// Whether the frame's story can be switched for another (or, with
// `remount`, rendered again) without the preview reloading the frame.
export const isSettled = (win: Window | null | undefined, remount = false) => {
  try {
    const phase = (win as PreviewWindow | null | undefined)
      ?.__STORYBOOK_PREVIEW__?.currentRender?.phase;
    return !!phase && (remount ? SETTLED_FOR_REMOUNT : SETTLED).has(phase);
  } catch {
    return false;
  }
};

// Runs `fn` once the frame's story (with `storyId`, that story) has
// rendered (now, if it has). Returns a function that cancels the wait.
export const whenRendered = (
  win: Window | null | undefined,
  fn: () => void,
  storyId?: string
): (() => void) => {
  if (isRendered(win, storyId)) {
    fn();
    return () => {};
  }
  const channel = channelOf(win);
  if (!channel) return () => {};
  // `storyRendered` carries the story id.
  const once = (id: unknown) => {
    if (storyId !== undefined && id !== storyId) return;
    channel.off('storyRendered', once);
    fn();
  };
  channel.on('storyRendered', once);
  return () => channel.off('storyRendered', once);
};

// Frame documents something is rendering again: the canvas while it
// switches the story or globals, an args update until its remount has
// rendered. Two at once would remount a story that is still busy, and the
// preview then reloads the frame. Per document: a reload drops them all.
const holds = new WeakMap<Document, number>();

const docOf = (win: Window | null | undefined) => {
  try {
    return win?.document;
  } catch {
    return undefined;
  }
};

// Marks the frame as busy until the returned function is called.
export const holdFrame = (win: Window | null | undefined): (() => void) => {
  const doc = docOf(win);
  if (!doc) return () => {};
  holds.set(doc, (holds.get(doc) ?? 0) + 1);
  let held = true;
  return () => {
    if (!held) return;
    held = false;
    holds.set(doc, Math.max(0, (holds.get(doc) ?? 1) - 1));
  };
};

export const isHeld = (win: Window | null | undefined) => {
  const doc = docOf(win);
  return !!doc && (holds.get(doc) ?? 0) > 0;
};

const FAILED = ['storyMissing', 'storyErrored', 'storyThrewException'];

const POLL_MS = 50;
// A frame that stays busy this long drops the queued edits rather than
// remount a story that is still rendering (the preview would reload).
const QUEUE_TIMEOUT_MS = 5000;

// The args edits waiting for one frame document: merged in order, so a
// drag sends one patch with its last value. `reset` goes first.
type ArgsQueue = {
  win: Window;
  storyId: string;
  reset: boolean;
  patch: Record<string, unknown>;
  since: number;
  timer: number;
  // Whether an edit sent by the queue holds the frame.
  sending: boolean;
};
const queues = new WeakMap<Document, ArgsQueue>();

// A state shown on top of the story (lib/storyState.ts: Primary and
// Disabled): args a reset and a resync keep, per frame document and story.
const layers = new WeakMap<Document, Map<string, Record<string, unknown>>>();
// A patch value that puts the story's own initial value back.
const INITIAL = Symbol('initial');

const layerArgsOf = (doc: Document, storyId: string) =>
  layers.get(doc)?.get(storyId) ?? {};

const currentRenderOf = (win: Window | null | undefined) => {
  try {
    return (win as PreviewWindow | null | undefined)?.__STORYBOOK_PREVIEW__
      ?.currentRender;
  } catch {
    return undefined;
  }
};

const isQueued = (q: ArgsQueue) => q.reset || Object.keys(q.patch).length > 0;

// An edit already in the frame finishes (and holds it until then).
const dropQueue = (doc: Document, q: ArgsQueue) => {
  window.clearTimeout(q.timer);
  q.timer = 0;
  q.reset = false;
  q.patch = {};
  if (queues.get(doc) === q) queues.delete(doc);
};

// Sends what is queued as one `updateStoryArgs` (a reset is the story's
// initial args, under the patch) and remounts once it is in the store,
// holding the frame until the remount has rendered.
const flush = (doc: Document, q: ArgsQueue) => {
  const found = channelOf(q.win);
  const render = currentRenderOf(q.win);
  // The frame shows another story now: its edits went with the old one.
  if (!found || !render || render.id !== q.storyId) {
    dropQueue(doc, q);
    return;
  }
  const channel = found;
  const updatedArgs: Record<string, unknown> = {};
  if (q.reset) {
    const initial = render.story?.initialArgs ?? {};
    const now = previewOf(q.win)?.storyStoreValue?.args?.get(q.storyId) ?? {};
    new Set([...Object.keys(initial), ...Object.keys(now)]).forEach((k) => {
      updatedArgs[k] = initial[k];
    });
    Object.assign(updatedArgs, layerArgsOf(doc, q.storyId));
  }
  Object.entries(q.patch).forEach(([k, v]) => {
    updatedArgs[k] = v === INITIAL ? render.story?.initialArgs?.[k] : v;
  });
  q.reset = false;
  q.patch = {};
  const storyId = q.storyId;
  const release = holdFrame(q.win);
  q.sending = true;
  let remounted = false;
  const finish = () => {
    window.clearTimeout(timer);
    channel.off('storyArgsUpdated', updated);
    channel.off('storyRendered', rendered);
    FAILED.forEach((e) => channel.off(e, finish));
    q.sending = false;
    release();
  };
  const timer = window.setTimeout(finish, QUEUE_TIMEOUT_MS);
  function updated(payload: { storyId?: string }) {
    if (payload?.storyId !== storyId) return;
    channel.off('storyArgsUpdated', updated);
    remounted = true;
    channel.emit('forceRemount', { storyId });
  }
  function rendered(id: unknown) {
    if (remounted && id === storyId) finish();
  }
  channel.on('storyArgsUpdated', updated);
  channel.on('storyRendered', rendered);
  FAILED.forEach((e) => channel.on(e, finish));
  channel.emit('updateStoryArgs', { storyId, updatedArgs });
};

// The one poller of a frame's queue: sends once the canvas does not hold
// the frame and its story can be remounted, until nothing is left.
const poll = (doc: Document, q: ArgsQueue) => {
  q.timer = 0;
  if (queues.get(doc) !== q) return;
  // The frame loaded another document: the edits went with the old one.
  if (docOf(q.win) !== doc) {
    dropQueue(doc, q);
    return;
  }
  if (!isQueued(q)) {
    queues.delete(doc);
    return;
  }
  const held = holds.get(doc) ?? 0;
  if (!held && isSettled(q.win, true)) {
    q.since = Date.now();
    flush(doc, q);
  } else if (held > (q.sending ? 1 : 0)) {
    // The canvas holds the frame for a switch: its time is not the story's.
    q.since = Date.now();
  } else if (Date.now() - q.since > QUEUE_TIMEOUT_MS) {
    dropQueue(doc, q);
    return;
  }
  if (queues.get(doc) === q) {
    q.timer = window.setTimeout(() => poll(doc, q), POLL_MS);
  }
};

const enqueue = (
  win: Window | null | undefined,
  storyId: string,
  edit: { reset?: boolean; patch?: Record<string, unknown> }
) => {
  const doc = docOf(win);
  if (!win || !doc) return;
  let q = queues.get(doc);
  if (q && q.storyId !== storyId) {
    dropQueue(doc, q);
    q = undefined;
  }
  if (!q) {
    q = {
      win,
      storyId,
      reset: false,
      patch: {},
      since: Date.now(),
      timer: 0,
      sending: false,
    };
    queues.set(doc, q);
  }
  if (!isQueued(q)) q.since = Date.now();
  if (edit.reset) {
    q.reset = true;
    q.patch = {};
  }
  Object.assign(q.patch, edit.patch);
  if (!q.timer) poll(doc, q);
};

export const updateArgs = (
  win: Window | null | undefined,
  storyId: string,
  updatedArgs: Record<string, unknown>
) => enqueue(win, storyId, { patch: updatedArgs });

export const resetArgs = (win: Window | null | undefined, storyId: string) =>
  enqueue(win, storyId, { reset: true });

// Lays a state's args over the frame's story, taking off what the last
// one set; sends only what the story's stored args lack.
export const setLayerArgs = (
  win: Window | null | undefined,
  storyId: string,
  args: Record<string, unknown>
) => {
  const doc = docOf(win);
  if (!doc) return;
  const map = layers.get(doc) ?? new Map<string, Record<string, unknown>>();
  layers.set(doc, map);
  const prev = map.get(storyId) ?? {};
  map.set(storyId, args);
  let now: Record<string, unknown> | undefined;
  try {
    now = previewOf(win)?.storyStoreValue?.args?.get(storyId);
  } catch {
    now = undefined;
  }
  const initial = currentRenderOf(win)?.story?.initialArgs ?? {};
  const patch: Record<string, unknown> = {};
  Object.keys(prev).forEach((k) => {
    if (!(k in args) && (!now || !Object.is(now[k], initial[k]))) {
      patch[k] = INITIAL;
    }
  });
  Object.entries(args).forEach(([k, v]) => {
    if (!now || JSON.stringify(now[k]) !== JSON.stringify(v)) patch[k] = v;
  });
  if (Object.keys(patch).length > 0) enqueue(win, storyId, { patch });
};

// Drops the edits still queued for the frame (an edit already in the
// frame finishes).
export const cancelArgs = (win: Window | null | undefined) => {
  const doc = docOf(win);
  const q = doc && queues.get(doc);
  if (doc && q) dropQueue(doc, q);
};

// Queues what a frame's story lacks of `edits` (every edit made since the
// story loaded): edits dropped while the frame was busy, so frames side by
// side do not silently disagree. A reset that was dropped goes again first.
// Nothing while the frame still has edits queued.
export const resyncArgs = (
  win: Window | null | undefined,
  storyId: string,
  ownEdits: Record<string, unknown>
) => {
  const doc = docOf(win);
  const q = doc && queues.get(doc);
  if (q && isQueued(q)) return;
  const edits = doc ? { ...layerArgsOf(doc, storyId), ...ownEdits } : ownEdits;
  const render = currentRenderOf(win);
  if (!render || render.id !== storyId) return;
  let now: Record<string, unknown> | undefined;
  try {
    now = previewOf(win)?.storyStoreValue?.args?.get(storyId);
  } catch {
    now = undefined;
  }
  if (!now) return;
  const initial = render.story?.initialArgs ?? {};
  const stale = Object.keys(now).some(
    (k) => !(k in edits) && !Object.is(now[k], initial[k])
  );
  const patch: Record<string, unknown> = {};
  Object.keys(edits).forEach((k) => {
    if (stale || !Object.is(now[k], edits[k])) patch[k] = edits[k];
  });
  if (stale || Object.keys(patch).length > 0) {
    enqueue(win, storyId, { reset: stale, patch });
  }
};

// ------------------------------------------------------------ controls

export type Control =
  | { name: string; kind: 'boolean'; description?: string }
  | { name: string; kind: 'string'; colour: boolean; description?: string }
  | { name: string; kind: 'number'; description?: string }
  | {
      name: string;
      kind: 'select';
      // The values go back to the story as they are (numbers, booleans).
      options: Option[];
      description?: string;
    };

export type Option = { label: string; value: string | number | boolean };

const SELECTS = new Set([
  'select',
  'radio',
  'inline-radio',
  'multi-select',
  'check',
  'inline-check',
]);

// The input an argType gets, or null when it needs code (objects, React
// nodes, functions). The control type wins over the TypeScript type.
export const controlOf = (name: string, t: ArgType): Control | null => {
  if (t.table?.disable || t.control === false) return null;
  const control =
    typeof t.control === 'string' ? t.control : t.control?.type ?? undefined;
  const description = t.description || undefined;
  const typeName = t.type?.name;
  const enumValues = Array.isArray(t.type?.value) ? t.type?.value : undefined;
  const options = (
    t.options ??
    (typeof t.control === 'object' && t.control ? t.control.options : null) ??
    enumValues ??
    []
  )
    .filter((o): o is string | number | boolean =>
      ['string', 'number', 'boolean'].includes(typeof o)
    )
    .map((value) => ({ label: String(value), value }));

  if (control === 'boolean' || (!control && typeName === 'boolean')) {
    return { name, kind: 'boolean', description };
  }
  if (control === 'number' || control === 'range') {
    return { name, kind: 'number', description };
  }
  if (control && SELECTS.has(control)) {
    if (control.includes('check') || control === 'multi-select') return null;
    return options.length
      ? { name, kind: 'select', options, description }
      : null;
  }
  if (control === 'text' || control === 'color' || control === 'date') {
    return { name, kind: 'string', colour: control === 'color', description };
  }
  if (control) return null; // object, file, ...
  if (typeName === 'number') return { name, kind: 'number', description };
  if (typeName === 'string') {
    return { name, kind: 'string', colour: false, description };
  }
  if (typeName === 'enum' && options.length) {
    return { name, kind: 'select', options, description };
  }
  return null;
};

// Controls of a story: the args the story sets first, then the rest, each
// group in argTypes order. `skipped` counts the props that need code.
export const controlsOf = (
  story: PreparedStory
): { controls: Control[]; skipped: number } => {
  // A prop typed as a React node that the story fills with plain text
  // (a button label) gets a text input too.
  const all = Object.entries(story.argTypes).map(
    ([name, t]) =>
      controlOf(name, t) ??
      (typeof story.args[name] === 'string' && t.control !== false
        ? ({ name, kind: 'string', colour: false } as Control)
        : null)
  );
  const controls = all.filter((c): c is Control => c !== null);
  const set = (c: Control) => story.args[c.name] !== undefined;
  return {
    controls: [...controls.filter(set), ...controls.filter((c) => !set(c))],
    skipped: all.length - controls.length,
  };
};
