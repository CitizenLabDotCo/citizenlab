import { splitSelectors } from './cascade';
import { compose, parseCss } from './cssParse';

/* eslint-disable @typescript-eslint/no-var-requires */
const React = require('react');
const { render } = require('@testing-library/react');
const sc = require('styled-components');
/* eslint-enable @typescript-eslint/no-var-requires */

type Flat = { selector: string; atRules: string[]; decls: string[] };

const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
// stylis writes a condition compressed, `(max-width:100px)`; the trace
// compares conditions only through the browser's canonical form.
const condition = (s: string) => norm(s).replace(/\s*:\s*/g, ':');
const selectorOf = (s: string) => splitSelectors(s).map(norm).join(',');

// The oracle: styled-components 5.3.9 itself. The text becomes a styled
// component's only rule; what it inserts (stylis 3 and the
// self-reference plugin, vendor prefixes off) is read back from the sheet.
const inserted = (text: string) => {
  const strings = Object.assign([text], { raw: [text] });
  const C = sc.default.div(strings);
  const { container } = render(
    React.createElement(
      sc.StyleSheetManager,
      { disableVendorPrefixes: true },
      React.createElement(C)
    )
  );
  const el = container.firstChild as Element;
  const name = [...el.classList].find((c) => !c.startsWith('sc-')) as string;
  const id = [...el.classList].find((c) => c.startsWith('sc-')) as string;
  const out: Flat[] = [];
  const walk = (rules: CSSRuleList, atRules: string[]) => {
    for (const r of Array.from(rules)) {
      const media = r as CSSMediaRule;
      if (media.media) {
        walk(media.cssRules, [
          ...atRules,
          condition(`@media ${media.media.mediaText}`),
        ]);
        continue;
      }
      const rule = r as CSSStyleRule;
      if (!rule.selectorText?.includes(`.${name}`)) continue;
      const decls: string[] = [];
      for (let i = 0; i < rule.style.length; i++) {
        const p = rule.style[i];
        const important = rule.style.getPropertyPriority(p)
          ? ' !important'
          : '';
        decls.push(`${p}: ${norm(rule.style.getPropertyValue(p))}${important}`);
      }
      out.push({ selector: selectorOf(rule.selectorText), atRules, decls });
    }
  };
  for (const s of Array.from(document.querySelectorAll('style'))) {
    const sheet = (s as HTMLStyleElement).sheet;
    if (sheet) walk(sheet.cssRules, []);
  }
  return { name, id, rules: out };
};

const parsed = (text: string, name: string, id: string): Flat[] =>
  parseCss([{ text, at: 0 }], name, id).map((r) => ({
    selector: selectorOf(r.selector),
    atRules: r.atRules.map(condition),
    decls: r.decls.map(
      (d) => `${d.prop}: ${norm(d.value)}${d.important ? ' !important' : ''}`
    ),
  }));

describe('parseCss against styled-components 5.3.9', () => {
  it.each([
    [
      'nesting, &, comma lists',
      `
  color: red;
  .a, .b {
    margin: 0;
    &:hover, & + & {
      padding: 1px;
    }
  }
  &.x { top: 0; }
  & > span { left: 0 !important; }
`,
    ],
    [
      'media, nested and at the top',
      `
  color: blue;
  @media (max-width: 100px) {
    color: green;
    .c { left: 0; }
  }
  .d {
    @media (min-width: 10px) { right: 0; }
  }
`,
    ],
    [
      'both comment kinds',
      `
  /* a block
     comment */
  color: green; // a line comment
  // a whole line
  background: url(http://x.y/z.png);
  top: 1px /* inside */;
  bottom: 2px;
`,
    ],
  ])('%s', (_label, text) => {
    const { name, id, rules } = inserted(text);
    expect(rules.length).toBeGreaterThan(0);
    expect(parsed(text, name, id)).toEqual(rules);
  });
});

// stylis writes `stray;` through (`.n{top:1px;stray;bottom:2px;}`) and a
// browser drops it; jsdom's parser reads `stray;bottom` as one name, so this
// case is checked on its own.
describe('a segment with no colon', () => {
  it('is no declaration', () => {
    const [rule] = parseCss(
      [{ text: 'stray; bottom: 2px;', at: 0 }],
      'n',
      'sc-x'
    );
    expect(rule.decls.map((d) => d.prop)).toEqual(['bottom']);
  });
});

describe('compose', () => {
  it('cross-multiplies each child with each parent', () => {
    expect(compose(['.p', '.q'], ['.a', '&:hover'])).toEqual([
      '.p .a',
      '.q .a',
      '.p:hover',
      '.q:hover',
    ]);
  });
});

describe('origins', () => {
  it('keeps the piece each character of a declaration came from', () => {
    const t = { id: 't' } as never;
    const rules = parseCss(
      [
        {
          text: 'border-radius: ',
          origin: { kind: 'quasi', template: t, k: 0, path: [] },
          at: 0,
        },
        {
          text: '3px',
          origin: { kind: 'expr', template: t, k: 0, value: '3px', path: [] },
          at: 0,
        },
        {
          text: ';',
          origin: { kind: 'quasi', template: t, k: 1, path: [] },
          at: 0,
        },
      ],
      'n',
      'sc-x'
    );
    const d = rules[0].decls[0];
    expect(d.prop).toBe('border-radius');
    expect(d.propOrigins.map((s) => [s.origin.kind, s.from, s.to])).toEqual([
      ['quasi', 0, 13],
    ]);
    expect(d.valueOrigins.map((s) => [s.origin.kind, s.from, s.to])).toEqual([
      ['expr', 0, 3],
    ]);
  });
});
