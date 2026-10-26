// Where an element of the running platform comes from, read from React
// itself: in a dev build React 18 keeps, on each element it rendered, the
// file and line of the JSX that made it and the component that rendered
// it. No hooks in the platform; a production build (the epic) has none of
// this, and React 19 dropped it.

type DebugSource = {
  fileName: string;
  lineNumber: number;
  columnNumber?: number;
};

type Fiber = {
  type: unknown;
  return: Fiber | null;
  memoizedProps?: unknown;
  _debugSource?: DebugSource | null;
  _debugOwner?: Fiber | null;
  alternate?: Fiber | null;
};

// One JSX site above the element: `<StyledButton …>` in Button/index.tsx
// at line 825, written in the component Button.
export type Site = {
  file: string;
  line: number;
  col?: number;
  // What the JSX renders there (StyledButton, div).
  element: string;
  // The component whose code it is.
  owner?: string;
};

export type Source = {
  // Nearest first, platform files only.
  sites: Site[];
  // The props written at the nearest site, short.
  props: [string, string][];
};

const fiberOf = (el: Element): Fiber | undefined => {
  const key = Object.keys(el).find((k) => k.startsWith('__reactFiber$'));
  return key
    ? (el as unknown as Record<string, Fiber>)[key] ?? undefined
    : undefined;
};

// A component's name: its displayName, a function's name, through
// forwardRef and memo.
export const nameOf = (type: unknown): string | undefined => {
  if (typeof type === 'string') return type;
  if (typeof type === 'function') {
    const f = type as { displayName?: string; name?: string };
    return f.displayName || f.name || undefined;
  }
  if (type && typeof type === 'object') {
    const o = type as {
      displayName?: string;
      render?: unknown;
      type?: unknown;
    };
    return o.displayName || nameOf(o.render) || nameOf(o.type);
  }
  return undefined;
};

// The file relative to front/ (app/…), or undefined outside the platform's
// own code (a package, Storybook).
export const platformFile = (fileName: string): string | undefined => {
  if (/\/node_modules\//.test(fileName)) return undefined;
  const m = fileName.match(/(?:^|\/)(app\/.+)$/);
  return m ? m[1] : undefined;
};

// "Button" for app/.../Button/index.tsx, else the file's name.
export const fileTitle = (file: string) => {
  const parts = file.split('/');
  const last = parts[parts.length - 1].replace(/\.tsx?$/, '');
  return last === 'index' ? parts[parts.length - 2] : last;
};

// Names the dev build makes up (React Refresh's _c7, a minified letter).
const generated = (name?: string) =>
  !name || /^_?[a-z]?\d*$|^_c\d*$/.test(name);

// Plumbing every element passes through (the messages wrapper): not what
// the person means by "this component".
const PLUMBING = /^app\/utils\//;

const MAX_SITES = 6;
const MAX_PROP = 60;

const propText = (v: unknown): string | undefined => {
  if (v === null || v === undefined) return undefined;
  if (typeof v === 'string') {
    return JSON.stringify(
      v.length > MAX_PROP ? `${v.slice(0, MAX_PROP - 1)}…` : v
    );
  }
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'function') return 'function';
  if (Array.isArray(v)) return `[${v.length}]`;
  if (typeof v === 'object' && '$$typeof' in (v as object)) return 'element';
  return '{…}';
};

export const propsOf = (props: unknown): [string, string][] => {
  if (!props || typeof props !== 'object') return [];
  return Object.entries(props as Record<string, unknown>)
    .filter(([k]) => k !== 'children')
    .map(([k, v]) => [k, propText(v)] as const)
    .filter((p): p is [string, string] => p[1] !== undefined)
    .slice(0, 16);
};

export const sourceOf = (el: Element): Source | null => {
  let fiber: Fiber | null | undefined = fiberOf(el);
  if (!fiber) return null;
  const sites: Site[] = [];
  let first: Fiber | undefined;
  for (let i = 0; fiber && i < 400 && sites.length < MAX_SITES; i++) {
    const src = fiber._debugSource;
    const file = src ? platformFile(src.fileName) : undefined;
    if (src && file) {
      const last = sites[sites.length - 1];
      // A host element and its styled wrapper often share the line.
      if (!last || last.file !== file || last.line !== src.lineNumber) {
        const owner = fiber._debugOwner
          ? nameOf(fiber._debugOwner.type)
          : undefined;
        sites.push({
          file,
          line: src.lineNumber,
          col: src.columnNumber,
          // A generated name: the component this JSX renders is the one
          // whose code the site below it is in.
          element: generated(nameOf(fiber.type))
            ? last?.owner ?? nameOf(fiber.type) ?? 'element'
            : nameOf(fiber.type)!,
          // The owner's code is this file: its name when React has none.
          owner: generated(owner) ? fileTitle(file) : owner,
        });
        if (!PLUMBING.test(file)) first ??= fiber;
      }
    }
    fiber = fiber.return;
  }
  const own = sites.filter((s) => !PLUMBING.test(s.file));
  return {
    sites: own.length ? own : sites,
    props: first ? propsOf(first.memoizedProps) : [],
  };
};

// The component an element belongs to: the nearest JSX above it written in
// the platform's own code, and the mounted component that wrote it. `keys`
// are that mount's two fibers (React swaps them between renders), so the
// elements of one mount group together.
export type Owner = { file: string; name: string; keys: object[] };

export const ownerOf = (el: Element): Owner | null => {
  let fiber: Fiber | null | undefined = fiberOf(el);
  for (let i = 0; fiber && i < 60; i++) {
    const src = fiber._debugSource;
    const file = src ? platformFile(src.fileName) : undefined;
    if (file && !PLUMBING.test(file)) {
      const owner = fiber._debugOwner;
      const name = owner ? nameOf(owner.type) : undefined;
      const mount = owner ?? fiber;
      return {
        file,
        name: name && !generated(name) ? name : fileTitle(file),
        keys: mount.alternate ? [mount, mount.alternate] : [mount],
      };
    }
    fiber = fiber.return;
  }
  return null;
};

export const isLibrary = (site: Site) =>
  site.file.startsWith('app/component-library/');

// What the person clicked, as a component: the nearest library component
// on the way up (a Button, not the text inside it), else the nearest one.
export const componentSite = (src: Source | null): Site | undefined =>
  src?.sites.find(isLibrary) ?? src?.sites[0];
