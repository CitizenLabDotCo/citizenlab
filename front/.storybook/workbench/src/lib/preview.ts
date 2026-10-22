// The parts of Storybook's preview (10.4) the shell talks to inside a canvas
// frame. Same origin, so the frame's window is reachable:
//
// - `__STORYBOOK_PREVIEW__.currentRender.story` is the prepared story: `id`,
//   `argTypes`, `initialArgs`. There is no `storyStore` property; the store
//   is `storyStoreValue`, and `storyStoreValue.args.get(id)` holds the
//   current args.
// - `__STORYBOOK_ADDONS_CHANNEL__` carries `updateStoryArgs` and
//   `resetStoryArgs` in, and `storyArgsUpdated` / `storyRendered` out.
//
// An args update reaches the store but the story does not re-render: the
// MemoryRouter decorator (app/utils/router.tsx) reads its children through
// a ref inside a memoised router. So every update is followed by
// `forceRemount`, which renders the story again with the stored args.

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
      };
    };
    storyStoreValue?: {
      args?: { get: (id: string) => Record<string, unknown> | undefined };
    };
  };
  __STORYBOOK_ADDONS_CHANNEL__?: Channel;
};

export const channelOf = (win: Window | null | undefined) =>
  (win as PreviewWindow | null | undefined)?.__STORYBOOK_ADDONS_CHANNEL__;

// Whether the frame's story has finished rendering.
export const isRendered = (win: Window | null | undefined) => {
  try {
    return (
      (win as PreviewWindow | null | undefined)?.__STORYBOOK_PREVIEW__
        ?.currentRender?.phase === 'finished'
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

const remountAfterUpdate = (channel: Channel, storyId: string) => {
  const done = (payload: { storyId?: string }) => {
    if (payload?.storyId !== storyId) return;
    channel.off('storyArgsUpdated', done);
    channel.emit('forceRemount', { storyId });
  };
  channel.on('storyArgsUpdated', done);
};

// Runs `fn` once the frame's story has rendered (now, if it has). Returns
// a function that cancels the wait.
export const whenRendered = (
  win: Window | null | undefined,
  fn: () => void
): (() => void) => {
  if (isRendered(win)) {
    fn();
    return () => {};
  }
  const channel = channelOf(win);
  if (!channel) return () => {};
  const once = () => {
    channel.off('storyRendered', once);
    fn();
  };
  channel.on('storyRendered', once);
  return () => channel.off('storyRendered', once);
};

export const updateArgs = (
  win: Window | null | undefined,
  storyId: string,
  updatedArgs: Record<string, unknown>
) => {
  const channel = channelOf(win);
  if (!channel) return;
  remountAfterUpdate(channel, storyId);
  channel.emit('updateStoryArgs', { storyId, updatedArgs });
};

export const resetArgs = (win: Window | null | undefined, storyId: string) => {
  const channel = channelOf(win);
  if (!channel) return;
  remountAfterUpdate(channel, storyId);
  channel.emit('resetStoryArgs', { storyId });
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
