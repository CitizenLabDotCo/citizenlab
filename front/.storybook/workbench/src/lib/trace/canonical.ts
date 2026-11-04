// Canonical forms through the frame's own CSS parser: a selector, an
// at-rule's condition, a declaration's longhands, each as the browser
// serializes it after parsing `new frame.CSSStyleSheet().replaceSync(...)`.
// The trace compares CSS text only in these forms, never by hand. The frame
// is a parameter so tests can hand in a double.

export type Canonicaliser = {
  // The selector list as selectorText, undefined when the browser rejects it.
  selector(text: string): string | undefined;
  // '@media (max-width: 769px)' -> '@media (max-width: 769px)' as the
  // browser writes its conditionText; undefined when rejected.
  atRule(text: string): string | undefined;
  // Every longhand the declaration sets, with its serialized value ('' for
  // a longhand pending var() substitution); undefined when rejected.
  longhands(prop: string, value: string): Map<string, string> | undefined;
  // The declaration's own serialization (a shorthand's when it has one).
  value(prop: string, value: string): string | undefined;
};

type SheetLike = { replaceSync(text: string): void; cssRules: CSSRuleList };

type Parsed = { rule?: CSSRule };

const memo = <T>(f: (key: string) => T) => {
  const cache = new Map<string, T>();
  return (key: string): T => {
    if (!cache.has(key)) cache.set(key, f(key));
    return cache.get(key) as T;
  };
};

const cache = new WeakMap<Window, Canonicaliser>();

export const canonicaliser = (frame: Window): Canonicaliser => {
  const known = cache.get(frame);
  if (known) return known;
  const Sheet = (frame as unknown as { CSSStyleSheet: new () => SheetLike })
    .CSSStyleSheet;
  const sheet = new Sheet();
  const parse = (text: string): Parsed => {
    try {
      sheet.replaceSync(text);
      return { rule: sheet.cssRules[0] };
    } catch {
      return {};
    }
  };
  const styleOf = (prop: string, value: string) => {
    const { rule } = parse(`x{${prop}:${value}}`);
    return (rule as CSSStyleRule | undefined)?.style;
  };

  const selector = memo((text) => {
    const { rule } = parse(`${text}{}`);
    return (rule as CSSStyleRule | undefined)?.selectorText;
  });
  const atRule = memo((text) => {
    const name = /^@[-\w]+/.exec(text.trim())?.[0];
    if (!name) return undefined;
    const { rule } = parse(`${text}{}`);
    if (!rule) return undefined;
    const condition =
      (rule as CSSConditionRule).conditionText ??
      (rule as CSSMediaRule).media?.mediaText;
    return condition === undefined ? undefined : `${name} ${condition}`;
  });
  const longhands = memo((key) => {
    const [prop, value] = JSON.parse(key) as [string, string];
    const style = styleOf(prop, value);
    if (!style || style.length === 0) return undefined;
    const out = new Map<string, string>();
    for (let i = 0; i < style.length; i++) {
      out.set(style[i], style.getPropertyValue(style[i]));
    }
    return out;
  });
  const value = memo((key) => {
    const [prop, v] = JSON.parse(key) as [string, string];
    const style = styleOf(prop, v);
    return style && style.length ? style.getPropertyValue(prop) : undefined;
  });

  const c: Canonicaliser = {
    selector,
    atRule,
    longhands: (prop, v) => longhands(JSON.stringify([prop, v])),
    value: (prop, v) => value(JSON.stringify([prop, v])),
  };
  cache.set(frame, c);
  return c;
};
