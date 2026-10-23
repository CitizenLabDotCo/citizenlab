/**
 * Instance props for the design workbench, riding along with gvTag. A
 * library component passes its props and its instance properties (the
 * props a designer may switch on one use, with their defaults) through
 * `useGvInstance`, spreads the returned `tag` on its root instead of
 * `gvTag(name)`, and renders with the returned `props`:
 *
 *   const { props, tag } = useGvInstance('Button', rawProps, { size: 's' });
 *
 * With VITE_GV_DESIGN_TAGS unset (production, participants) it returns the
 * props object it was given and an empty tag: no state, no effects, no
 * attribute, no global. The flag is fixed for a build, so the hook's path
 * never changes during a render's life.
 *
 * With the flag on (Storybook on design-system branches) each instance
 * gets `data-gv-instance` (a per-mount id) next to `data-gv-component`, and
 * a registry on the window holds what the workbench sets:
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

type Live = { name: string; refresh: () => void; report: () => InstanceReport };

export type InstanceRegistry = {
  overrides: InstanceOverrides;
  // The story rendering now; set by the preview before its story renders.
  scope: string;
  live: Map<string, Live>;
  next: number;
  onReport?: (reports: InstanceReport[]) => void;
  timer: ReturnType<typeof setTimeout> | null;
};

export const designTagsOn = () => process.env.VITE_GV_DESIGN_TAGS === '1';

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

// Replaces every override and renders the instances again. Anything that
// is not a plain value is dropped here; the instance drops props it does
// not declare.
export const setOverrides = (reg: InstanceRegistry, input: unknown) => {
  const clean: InstanceOverrides = {};
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
                const story = (clean[storyId] ??= {});
                (story[key] ??= {})[prop] = value;
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
  defaults: Partial<P>
): Result<P> => {
  const reg = registryOf();
  const uid = useRef('');
  if (!uid.current) uid.current = `${name}-${reg.next++}`;
  const [index, setIndex] = useState(-1);
  const [, refresh] = useReducer((n: number) => n + 1, 0);
  const names = Object.keys(defaults);
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
      report: () => {
        const { props: own, override: over } = latest.current;
        const raw = own as Record<string, unknown>;
        const el = elementOf(document, id);
        const base: Record<string, InstanceValue | null> = {};
        const shown: Record<string, InstanceValue | null> = {};
        names.forEach((k) => {
          base[k] = valueOf(raw[k] ?? (defaults as Record<string, unknown>)[k]);
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
    return () => {
      reg.live.delete(id);
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

/**
 * The props to render with and the root's tag. Flag off: `props` itself
 * and `{}`. `defaults` names the instance properties (keys) and their
 * defaults as the component applies them (undefined when it has none).
 */
export const useGvInstance = <P extends object>(
  name: string,
  props: P,
  defaults: Partial<P>
): Result<P> =>
  designTagsOn()
    ? // The flag is fixed for a build: the same branch on every render.
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useLiveInstance(name, props, defaults)
    : { props, tag: NO_TAG };
