// The only file that reads React's and styled-components' internals: an
// element's fiber, the styled component that rendered it, the context its
// template functions run with, and the class names styled-components
// generates. Each piece copies styled-components 5.3.9, from
// node_modules/styled-components/dist/styled-components.browser.esm.js (the
// minified names are quoted). checkInternals says when a build no longer has
// these fields; then nothing is traced, and nothing is guessed instead.

export type ContextItem = {
  memoizedValue?: unknown;
  next?: ContextItem | null;
};

export type Fiber = {
  elementType?: unknown;
  memoizedProps?: unknown;
  dependencies?: { firstContext?: ContextItem | null } | null;
  return?: Fiber | null;
};

export type ComponentStyle = {
  rules: unknown[];
  componentId: string;
  isStatic: boolean;
  baseHash: number;
  baseStyle?: ComponentStyle;
};

// The forwardRef object styled() returns, as its fiber's elementType.
export type StyledType = {
  styledComponentId: string;
  componentStyle: ComponentStyle;
  attrs: unknown[];
  defaultProps?: Record<string, unknown>;
};

export type Context = Record<string, unknown>;

const MAX_STEPS = 50;
const FIBER_KEY = '__reactFiber$';
export const SC_VERSION = '5.3.9';

// `E=Object.freeze({})`
export const EMPTY_OBJECT: Context = Object.freeze({});

const hasOwn = (o: object, k: string) =>
  Object.prototype.hasOwnProperty.call(o, k);

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

// The element's own fiber: React 18 keeps it under `__reactFiber$<random>`.
export const fiberOf = (el: Element): Fiber | undefined => {
  const key = Object.keys(el).find((k) => k.startsWith(FIBER_KEY));
  if (!key) return undefined;
  const fiber = (el as unknown as Record<string, unknown>)[key];
  return isObject(fiber) ? (fiber as Fiber) : undefined;
};

// The style prop React holds for a host element (`style={{ padding: 18 }}`),
// as written: numbers stay numbers.
export const hostStyleOf = (el: Element): Context | undefined => {
  const props = fiberOf(el)?.memoizedProps;
  const style = isObject(props) ? props.style : undefined;
  return isObject(style) ? style : undefined;
};

// `N(e)`: a styled component is anything with a string styledComponentId.
export const isStyledComponent = (v: unknown): boolean =>
  (typeof v === 'object' || typeof v === 'function') &&
  v !== null &&
  typeof (v as { styledComponentId?: unknown }).styledComponentId === 'string';

export const styledTypeOf = (fiber: Fiber): StyledType | undefined =>
  isStyledComponent(fiber.elementType)
    ? (fiber.elementType as StyledType)
    : undefined;

// Walks `.return` from the element's fiber to the styled component whose
// id is `componentId`.
export const styledFiber = (
  el: Element,
  componentId: string
): Fiber | undefined => {
  let fiber = fiberOf(el);
  for (let i = 0; fiber && i < MAX_STEPS; i++) {
    if (styledTypeOf(fiber)?.styledComponentId === componentId) return fiber;
    fiber = fiber.return ?? undefined;
  }
  return undefined;
};

// Every styled component above the element, nearest first.
export const styledFibers = (el: Element): Fiber[] => {
  const out: Fiber[] = [];
  let fiber = fiberOf(el);
  for (let i = 0; fiber && i < MAX_STEPS; i++) {
    if (styledTypeOf(fiber)) out.push(fiber);
    fiber = fiber.return ?? undefined;
  }
  return out;
};

// `Re=function(e,t,n){return void 0===n&&(n=E),e.theme!==n.theme&&e.theme||t||n.theme}`
export const determineTheme = (
  props: Context,
  providedTheme: unknown,
  defaultProps: Context = EMPTY_OBJECT
): unknown =>
  (props.theme !== defaultProps.theme && props.theme) ||
  providedTheme ||
  defaultProps.theme;

// The attrs merge inside the render function (`f=function(e,t,n){...}`):
// the context is the props plus the theme, and each attrs entry (called
// with the context when it is a function) writes its keys into it.
// className joins with the earlier attrs' className only, as in 5.3.9.
export const contextOf = (
  theme: unknown,
  props: Context,
  attrs: unknown[]
): Context => {
  const context: Context = {};
  for (const key in props) if (hasOwn(props, key)) context[key] = props[key];
  context.theme = theme === undefined ? EMPTY_OBJECT : theme;
  const resolved: Context = {};
  for (const entry of attrs) {
    const r =
      typeof entry === 'function'
        ? (entry as (c: Context) => unknown)(context)
        : entry;
    if (!isObject(r)) continue;
    for (const key in r) {
      let v = r[key];
      if (key === 'className') {
        const n = resolved[key];
        v = n && v ? `${n} ${v}` : n || v;
      }
      context[key] = resolved[key] = v;
    }
  }
  return context;
};

// The execution context the component's template functions ran with on its
// last render: `[r,o]=f(Re(t,s(Ge),a)||E,t,o)`. ThemeContext is the first
// useContext of every styled component, so the theme is the fiber's first
// context dependency.
export const execContext = (fiber: Fiber): Context | undefined => {
  const type = styledTypeOf(fiber);
  if (!type || !isObject(fiber.memoizedProps)) return undefined;
  const provided = fiber.dependencies?.firstContext?.memoizedValue;
  const theme =
    determineTheme(fiber.memoizedProps, provided, type.defaultProps) ||
    EMPTY_OBJECT;
  return contextOf(theme, fiber.memoizedProps, type.attrs);
};

// The component's styles, the base styles first (`this.baseStyle` runs
// before the component's own in generateAndInjectStyles).
export const componentStyles = (fiber: Fiber): ComponentStyle[] => {
  const type = styledTypeOf(fiber);
  const out: ComponentStyle[] = [];
  for (let cs = type?.componentStyle; cs; cs = cs.baseStyle) out.unshift(cs);
  return out;
};

// ------------------------------------------------------------ class names

// `te=function(e,t){for(var n=t.length;n;)e=33*e^t.charCodeAt(--n);return e}`
export const phash = (h: number, s: string): number => {
  let e = h;
  for (let n = s.length; n; ) e = (33 * e) ^ s.charCodeAt(--n);
  return e;
};

// `oe=ne("5.3.9")`, `ne=function(e){return te(5381,e)}`
const VERSION_HASH = phash(5381, SC_VERSION);

// `this.baseHash=te(oe,t)` in the ComponentStyle constructor.
export const baseHashOf = (componentId: string) =>
  phash(VERSION_HASH, componentId);

// `Q=function(e){return String.fromCharCode(e+(e>25?39:97))}`
const letter = (code: number) =>
  String.fromCharCode(code + (code > 25 ? 39 : 97));

// `function ee(e){...}` with `K=/(a)(d)/gi`
export const generateAlphabeticName = (code: number): string => {
  let name = '';
  let x: number;
  for (x = Math.abs(code); x > 52; x = (x / 52) | 0)
    name = letter(x % 52) + name;
  return (letter(x % 52) + name).replace(/(a)(d)/gi, '$1-$2');
};

// The class name a componentStyle generates for its rules, from what each
// rule flattened to (generateAndInjectStyles). `flat[d]` is rule d's
// flattened text, undefined for a rule the loop skips (a falsy non-string).
// A static style hashes its whole CSS; a dynamic one hashes each
// non-string rule's text with its index, and in a development build each
// string too. Undefined when the CSS is empty (no class is generated).
export const generatedNames = (
  cs: Pick<ComponentStyle, 'rules' | 'componentId' | 'isStatic'>,
  flat: (string | undefined)[]
): string[] => {
  const base = baseHashOf(cs.componentId);
  const css = flat.map((f) => f ?? '').join('');
  if (cs.isStatic) return [generateAlphabeticName(phash(base, css) >>> 0)];
  if (!css) return [];
  let prod = base;
  let dev = base;
  cs.rules.forEach((rule, d) => {
    const f = flat[d];
    if (typeof rule === 'string') {
      dev = phash(dev, rule + d);
    } else if (f !== undefined) {
      prod = phash(prod, f + d);
      dev = phash(dev, f + d);
    }
  });
  return [
    generateAlphabeticName(prod >>> 0),
    generateAlphabeticName(dev >>> 0),
  ];
};

// ------------------------------------------------------------ the guard

export type InternalsCheck = { ok: true } | { ok: false; missing: string };

const checked = new WeakMap<Document, InternalsCheck>();

const fail = (missing: string): InternalsCheck => ({ ok: false, missing });

// The fields the trace reads, on one styled element of the frame. Any
// missing or of the wrong type means the internals changed.
export const checkFiber = (
  fiber: Fiber | undefined,
  el: Element
): InternalsCheck => {
  if (!fiber) return fail('the element fiber (__reactFiber$)');
  const ids = [...el.classList].filter((c) => c.startsWith('sc-'));
  let at: Fiber | undefined = fiber;
  for (let i = 0; at && i < MAX_STEPS; i++) {
    const type = styledTypeOf(at);
    if (type && ids.includes(type.styledComponentId)) break;
    at = at.return ?? undefined;
  }
  const type = at && styledTypeOf(at);
  if (!at || !type) return fail('a styled fiber above the element (.return)');
  if (!Array.isArray(type.attrs)) return fail('attrs');
  const cs = type.componentStyle as Partial<ComponentStyle> | undefined;
  if (!isObject(cs)) return fail('componentStyle');
  if (!Array.isArray(cs.rules)) return fail('componentStyle.rules');
  if (typeof cs.componentId !== 'string')
    return fail('componentStyle.componentId');
  if (typeof cs.isStatic !== 'boolean') return fail('componentStyle.isStatic');
  if (cs.baseHash !== baseHashOf(cs.componentId))
    return fail('componentStyle.baseHash (5.3.9 hashing)');
  if (!isObject(at.memoizedProps)) return fail('memoizedProps');
  const first = at.dependencies?.firstContext;
  if (!isObject(first) || !('memoizedValue' in first))
    return fail('dependencies.firstContext.memoizedValue');
  return { ok: true };
};

// On first use per document: the styled-components version on the page,
// then the fields on its first styled element. A frame with no styled
// element yet is not cached, so a later render is checked.
export const checkInternals = (frame: Window): InternalsCheck => {
  const doc = frame.document;
  const known = checked.get(doc);
  if (known) return known;
  const version = doc
    .querySelector('style[data-styled-version]')
    ?.getAttribute('data-styled-version');
  const el = [...doc.querySelectorAll('[class*="sc-"]')].find((e) =>
    [...e.classList].some((c) => c.startsWith('sc-'))
  );
  if (!el && !version) return { ok: true };
  const result =
    version !== SC_VERSION
      ? fail(`styled-components ${SC_VERSION} (found ${version ?? 'none'})`)
      : el
      ? checkFiber(fiberOf(el), el)
      : undefined;
  if (!result) return { ok: true };
  checked.set(doc, result);
  return result;
};
