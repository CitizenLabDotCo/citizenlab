/**
 * Instance props for the design workbench, riding along with gvTag. A
 * library component passes its props and its instance properties (the
 * props a designer may switch on one use, with their defaults) through
 * `useGvInstance`, spreads the returned `tag` on its root instead of
 * `gvTag(name)`, and renders with the returned `props`:
 *
 *   const { props, tag } = useGvInstance('Button', rawProps, { size: 's' });
 *
 * Two flags, both fixed for a build, so the hook's path never changes
 * during a render's life:
 * - VITE_GV_DESIGN_TAGS unset (production, participants): the props object
 *   it was given and an empty tag. No state, effect, attribute or global.
 * - VITE_GV_DESIGN_TAGS=1 alone (an app build of a design-system branch):
 *   the props object and `data-gv-component`, as gvTag gives. Nothing else.
 * - VITE_GV_DESIGN_TAGS=1 and VITE_GV_INSTANCE_PROPS=1 (Storybook only,
 *   .storybook/main.ts): the live path. Each instance gets
 *   `data-gv-instance` (a per-mount id) next to `data-gv-component`, and a
 *   registry on the window holds what the workbench sets:
 * - overrides, per story id, keyed `<Name>#<index>`: the index is the
 *   instance's place among the document's elements tagged with the same
 *   name, in DOM order, a held copy of a previous story skipped. Only the
 *   declared instance properties, and only plain values, are taken.
 * - a report of every mounted instance: its index, the instance properties
 *   as rendered (the default when nothing sets one), what the parent's code
 *   passes and which ones an override changed.
 * The registry knows nothing of Storybook; `.storybook/instanceProps.tsx`
 * connects it to the preview's channel.
 */
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

export const INSTANCE_ATTR = 'data-gv-instance';
export const REGISTRY_KEY = '__GV_INSTANCES__';
const COMPONENT_ATTR = 'data-gv-component';
// The workbench keeps the previous story on screen as an inert copy while
// the next one renders (lib/canvasSwitch.ts holdStory): never an instance.
const HELD = '[data-wb-held]';

export type InstanceValue = string | number | boolean;

export type InstanceReport = {
  uid: string;
  name: string;
  // -1 while the instance is not in the document.
  index: number;
  // The instance properties as rendered: the override, else what the
  // parent's code passes, else the default (null when there is none).
  props: Record<string, InstanceValue | null>;
  // The same without the override.
  base: Record<string, InstanceValue | null>;
  // The instance properties the parent's code passes.
  set: string[];
  // The instance properties an override changes.
  overridden: string[];
};

// Story id -> `<Name>#<index>` -> prop -> value.
export type InstanceOverrides = Partial<
  Record<string, Partial<Record<string, Record<string, InstanceValue>>>>
>;

type Live = {
  name: string;
  refresh: () => void;
  // Reads the instance's place again; renders only when it moved.
  reindex: () => void;
  report: () => InstanceReport;
};

export type InstanceRegistry = {
  overrides: InstanceOverrides;
  // The story rendering now; set by the preview before its story renders.
  scope: string;
  live: Map<string, Live>;
  next: number;
  onReport?: (reports: InstanceReport[]) => void;
  timer: ReturnType<typeof setTimeout> | null;
  reindexing: boolean;
};

export const designTagsOn = () => process.env.VITE_GV_DESIGN_TAGS === '1';

// The live path: Storybook's workbench only, never an app build.
export const instancePropsOn = () =>
  designTagsOn() && process.env.VITE_GV_INSTANCE_PROPS === '1';

type WithRegistry = { [REGISTRY_KEY]?: InstanceRegistry };

// The window's registry, made on first use.
export const registryOf = (win: Window = window): InstanceRegistry => {
  const host = win as unknown as WithRegistry;
  let reg = host[REGISTRY_KEY];
  if (!reg) {
    reg = {
      overrides: {},
      scope: '',
      live: new Map(),
      next: 0,
      timer: null,
      reindexing: false,
    };
    host[REGISTRY_KEY] = reg;
  }
  return reg;
};

const isValue = (v: unknown): v is InstanceValue =>
  typeof v === 'string' ||
  typeof v === 'boolean' ||
  (typeof v === 'number' && Number.isFinite(v));

// Sends one report of every mounted instance, after the current batch of
// renders.
export const scheduleReport = (reg: InstanceRegistry) => {
  if (reg.timer !== null || !reg.onReport) return;
  reg.timer = setTimeout(() => {
    reg.timer = null;
    const reports = [...reg.live.values()].map((l) => l.report());
    reg.onReport?.(reports);
  }, 0);
};

// After an instance mounts or unmounts, every other one reads its place
// again: a conditional mount earlier in the page shifts the indexes, and an
// override must follow its instance, not its old number. Once per batch.
const scheduleReindex = (reg: InstanceRegistry) => {
  if (reg.reindexing) return;
  reg.reindexing = true;
  queueMicrotask(() => {
    reg.reindexing = false;
    reg.live.forEach((l) => l.reindex());
  });
};

// Story ids and keys come from outside: objects without a prototype, so
// `constructor` is a key like any other.
const bare = <T>(): Record<string, T> => Object.create(null);

// Replaces every override and renders the instances again. Anything that
// is not a plain value is dropped here; the instance drops props it does
// not declare.
export const setOverrides = (reg: InstanceRegistry, input: unknown) => {
  const clean: InstanceOverrides = bare();
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    Object.entries(input as Record<string, unknown>).forEach(
      ([storyId, byKey]) => {
        if (!byKey || typeof byKey !== 'object') return;
        Object.entries(byKey as Record<string, unknown>).forEach(
          ([key, props]) => {
            if (!props || typeof props !== 'object') return;
            Object.entries(props as Record<string, unknown>).forEach(
              ([prop, value]) => {
                if (!isValue(value)) return;
                const story = (clean[storyId] ??= bare());
                (story[key] ??= bare())[prop] = value;
              }
            );
          }
        );
      }
    );
  }
  if (JSON.stringify(clean) === JSON.stringify(reg.overrides)) return;
  reg.overrides = clean;
  reg.live.forEach((l) => l.refresh());
  scheduleReport(reg);
};

export const setScope = (reg: InstanceRegistry, storyId: string) => {
  reg.scope = storyId;
};

const notHeld = (el: Element) => !el.closest(HELD);

// The instance's place among the same-named tagged elements, DOM order.
export const instanceIndex = (el: Element, name: string): number =>
  Array.from(el.ownerDocument.querySelectorAll(`[${COMPONENT_ATTR}="${name}"]`))
    .filter(notHeld)
    .indexOf(el);

const elementOf = (doc: Document, uid: string): Element | null =>
  Array.from(doc.querySelectorAll(`[${INSTANCE_ATTR}="${uid}"]`)).find(
    notHeld
  ) ?? null;

type Result<P> = { props: P; tag: Record<string, string> };

const NO_TAG: Record<string, string> = Object.freeze({}) as Record<
  string,
  string
>;

const valueOf = (v: unknown): InstanceValue | null => (isValue(v) ? v : null);

const useLiveInstance = <P extends object>(
  name: string,
  props: P,
  defaults: Partial<P>,
  orKeys: readonly string[]
): Result<P> => {
  const reg = registryOf();
  const uid = useRef('');
  if (!uid.current) uid.current = `${name}-${reg.next++}`;
  const [index, setIndex] = useState(-1);
  const [, refresh] = useReducer((n: number) => n + 1, 0);
  const names = Object.keys(defaults);
  const indexRef = useRef(index);
  indexRef.current = index;
  const found =
    index >= 0 ? reg.overrides[reg.scope]?.[`${name}#${index}`] : undefined;
  const override: Record<string, InstanceValue> = {};
  if (found) {
    names.forEach((k) => {
      if (k in found) override[k] = found[k];
    });
  }
  const merged =
    Object.keys(override).length > 0 ? ({ ...props, ...override } as P) : props;
  const latest = useRef({ props, override });
  latest.current = { props, override };

  // After every render: where the instance sits now. A new place renders
  // again before the browser paints, with that place's override. No deps
  // on purpose (a render elsewhere can move it); it settles once the place
  // is the one rendered with.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const el = elementOf(document, uid.current);
    const at = el ? instanceIndex(el, name) : -1;
    if (at !== index) setIndex(at);
    scheduleReport(reg);
  });

  useLayoutEffect(() => {
    const id = uid.current;
    reg.live.set(id, {
      name,
      refresh,
      reindex: () => {
        const el = elementOf(document, id);
        const at = el ? instanceIndex(el, name) : -1;
        if (at !== indexRef.current) setIndex(at);
      },
      report: () => {
        const { props: own, override: over } = latest.current;
        const raw = own as Record<string, unknown>;
        const el = elementOf(document, id);
        const base: Record<string, InstanceValue | null> = {};
        const shown: Record<string, InstanceValue | null> = {};
        const fallback = defaults as Record<string, unknown>;
        names.forEach((k) => {
          // As the component's render applies its default: `??`, or `||`
          // for the props it reads as `props.size || 's'`.
          base[k] = valueOf(
            orKeys.includes(k) ? raw[k] || fallback[k] : raw[k] ?? fallback[k]
          );
          shown[k] = k in over ? over[k] : base[k];
        });
        return {
          uid: id,
          name,
          index: el ? instanceIndex(el, name) : -1,
          props: shown,
          base,
          set: names.filter((k) => raw[k] !== undefined),
          overridden: Object.keys(over),
        };
      },
    });
    scheduleReindex(reg);
    return () => {
      reg.live.delete(id);
      scheduleReindex(reg);
      scheduleReport(reg);
    };
    // Once per mount: the report reads the latest props through the ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    props: merged,
    tag: { [COMPONENT_ATTR]: name, [INSTANCE_ATTR]: uid.current },
  };
};

const NO_KEYS: readonly string[] = [];

/**
 * The props to render with and the root's tag. Without the live path:
 * `props` itself, and `{}` or gvTag's attribute. `defaults` names the
 * instance properties (keys) and their defaults as the component applies
 * them (undefined when it has none); `orKeys` the ones it applies to any
 * falsy value (`props.size || 's'`) rather than to undefined.
 */
export const useGvInstance = <P extends object>(
  name: string,
  props: P,
  defaults: Partial<P>,
  orKeys: readonly (keyof P & string)[] = NO_KEYS as readonly (keyof P &
    string)[]
): Result<P> =>
  instancePropsOn()
    ? // The flags are fixed for a build: the same branch on every render.
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useLiveInstance(name, props, defaults, orKeys)
    : { props, tag: designTagsOn() ? { [COMPONENT_ATTR]: name } : NO_TAG };
