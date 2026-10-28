import {
  collectRules,
  Expands,
  originalPart,
  originalSelector,
  specificity,
  splitSelectors,
  winnerOf,
} from './cascade';
import { jsdomCanon, stubMatchMedia } from './fixture';

describe('specificity (Selectors 4)', () => {
  it.each([
    ['*', [0, 0, 0]],
    ['li', [0, 0, 1]],
    ['ul ol + li', [0, 0, 3]],
    ['h1 + *[rel=up]', [0, 1, 1]],
    ['ul ol li.red', [0, 1, 3]],
    ['li.red.level', [0, 2, 1]],
    ['#x34y', [1, 0, 0]],
    ['div#main.c[title]', [1, 2, 1]],
    ['#s12:not(foo)', [1, 0, 1]],
    [':not(.a, #b)', [1, 0, 0]],
    ['.foo :is(.bar, #baz)', [1, 1, 0]],
    [':where(#a, .b) p', [0, 0, 1]],
    ['a:has(> img)', [0, 0, 2]],
    [':nth-child(2n+1 of .item, #x)', [1, 1, 0]],
    ['p::first-line', [0, 0, 2]],
    ['a:hover::before', [0, 1, 2]],
    ['[data-x="a ] b"] > span', [0, 1, 1]],
    ['.a\\:b', [0, 1, 0]],
    ['.bsrTOk .sc-jTrPJq:not(.disabled):not(.processing):hover', [0, 5, 0]],
  ])('%s', (selector, expected) => {
    expect(specificity(selector)).toEqual(expected);
  });
});

describe('selector lists', () => {
  it('splits on top-level commas only', () => {
    expect(splitSelectors('a, :is(b, c), [x=","]')).toEqual([
      'a',
      ':is(b, c)',
      '[x=","]',
    ]);
  });

  it('takes the pseudo-states addon rewrites back out', () => {
    const text =
      '.x .b:hover, .x .b.pseudo-hover, .pseudo-hover-all .x .b, .x .b.focus';
    expect(originalSelector(text)).toBe('.x .b:hover, .x .b.focus');
    expect(originalPart(text, '.x .b.pseudo-hover')).toBe('.x .b:hover');
    expect(originalPart(text, '.x .b.focus')).toBe('.x .b.focus');
  });
});

describe('the winning declaration', () => {
  const expands: Expands = (prop, value, longhand) =>
    !!jsdomCanon.longhands(prop, value)?.has(longhand);

  const setup = (css: string, html: string) => {
    document.head.innerHTML = `<style>${css}</style>`;
    document.body.innerHTML = html;
    stubMatchMedia(window);
    const el = document.querySelector('#t') as HTMLElement;
    return { el, matched: collectRules(window, el) };
  };

  it('orders by importance, specificity, then order', () => {
    const { el, matched } = setup(
      `.a { color: red } #t { color: blue } .a.b { color: green }
       .b { color: pink !important } .a { color: black }`,
      '<p id="t" class="a b"></p>'
    );
    const w = winnerOf(el, 'color', matched, expands);
    expect(w.kind === 'rule' && w.declared).toEqual({
      prop: 'color',
      value: 'pink',
      important: true,
    });
    const normal = matched.filter((m) => !m.rule.cssText.includes('pink'));
    const w2 = winnerOf(el, 'color', normal, expands);
    expect(w2.kind === 'rule' && w2.declared.value).toBe('blue');
  });

  it('finds a longhand set by its shorthand, and the inline style first', () => {
    const { el, matched } = setup(
      '.a { padding: 1px 2px }',
      '<p id="t" class="a"></p>'
    );
    const w = winnerOf(el, 'padding-left', matched, expands);
    expect(w.kind === 'rule' && w.declared).toEqual({
      prop: 'padding',
      value: '1px 2px',
      important: false,
    });
    el.style.paddingLeft = '7px';
    const inline = winnerOf(el, 'padding-left', matched, expands, () => true);
    expect(inline).toEqual({
      kind: 'inline',
      declared: { prop: 'padding-left', value: '7px', important: false },
      painted: true,
    });
  });

  it('skips media that do not match and pseudo-elements', () => {
    const { el, matched } = setup(
      `@media (max-width: 1px) { .a { color: red } }
       .a::before { color: blue }`,
      '<p id="t" class="a"></p>'
    );
    expect(matched).toEqual([]);
    expect(winnerOf(el, 'color', matched, expands)).toEqual({ kind: 'none' });
  });
});
