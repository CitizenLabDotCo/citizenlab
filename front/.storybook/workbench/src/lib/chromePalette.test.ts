// Contrast of the shell's own colour roles (the --wb-* names in shell.css),
// in the light and the dark chrome. Every rule in the workbench CSS that
// sets a text colour and a background from those roles is a pair; a hover or
// pressed rule that only changes the background is paired with the colour of
// its base rule; text that sets no background of its own is checked on the
// surfaces it sits on. The a11y tones set --wb-a11y-fg and --wb-a11y-bg per
// tone, so each tone's pair is checked where it is defined. Each pair must reach WCAG AA: 4.5, or 3 for large or
// bold text (from 18.66px bold, 24px regular).
import fs from 'fs';
import path from 'path';

import { parseTokenCss, ratio, resolveTokens } from './contrast';

const src = path.resolve(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(src, p), 'utf8');
const tokenCss = fs.readFileSync(
  path.resolve(__dirname, '../../../../app/design-system/tokens/tokens.css'),
  'utf8'
);

const shell = read('shell.css');
const sheets = [shell, read('pages/proposal.css')]
  .join('\n')
  .replace(/\/\*[\s\S]*?\*\//g, '');

const roles = (selector: string) => {
  const start = shell.indexOf(`${selector} {`);
  const end = shell.indexOf('}', start);
  const out: Record<string, string> = {};
  for (const m of shell
    .slice(start, end)
    .matchAll(/(--wb-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    out[m[1]] = m[2].trim();
  }
  return out;
};

const gv = resolveTokens(parseTokenCss(tokenCss)).today;
const light = Object.fromEntries(
  Object.entries(roles(':root')).map(([k, v]) => [
    k,
    v.replace(/^var\((--gv-[a-z0-9-]+)\)$/, (_, name) => gv[name] ?? v),
  ])
);
const dark = { ...light, ...roles(":root[data-wb-theme='dark']") };
const palettes = { light, dark };

type Pair = { where: string; text: string; bg: string; large: boolean };

const role = (decl: string | undefined) =>
  decl?.match(/^var\((--wb-[a-z0-9-]+)\)$/)?.[1];

// Rule blocks with no braces inside, so the rules within @media come out too.
const rules = [...sheets.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => {
  const decls: Record<string, string> = {};
  for (const d of m[2].matchAll(/([a-z-]+)\s*:\s*([^;]+);/g)) {
    decls[d[1]] = d[2].trim();
  }
  return { selector: m[1].trim().replace(/\s+/g, ' '), decls };
});

const isLarge = (decls: Record<string, string>) => {
  const px = Number(decls['font-size']?.match(/^(\d+(?:\.\d+)?)px$/)?.[1]);
  const bold = Number(decls['font-weight']) >= 700;
  return px >= 24 || (bold && px >= 18.66);
};

// Where text that sets only its colour can sit.
const SURFACES = ['--wb-bg', '--wb-subtle', '--wb-hover'];
// Roles that colour marks (icons, dots, rings, borders), not text.
const MARKS = new Set(['--wb-faint', '--wb-neutral-mark']);

// Per-tone variables the a11y badges read: checked in the tone rules below.
const LOCAL = /^--wb-a11y-/;

const pairs: Pair[] = [];
for (const { selector, decls } of rules) {
  const fg = role(decls['--wb-a11y-fg']);
  const fill = role(decls['--wb-a11y-bg']);
  if (fg && fill)
    pairs.push({ where: selector, text: fg, bg: fill, large: false });
  if (fg) {
    for (const s of SURFACES) {
      pairs.push({
        where: `${selector} (on ${s})`,
        text: fg,
        bg: s,
        large: false,
      });
    }
  }
  const text = role(decls.color);
  if (text && LOCAL.test(text)) continue;
  const bg = role(decls.background ?? decls['background-color']);
  const large = isLarge(decls);
  if (text && bg) {
    pairs.push({ where: selector, text, bg, large });
  } else if (bg && !text && /:(hover|active|focus-visible)/.test(selector)) {
    // A state that keeps the base rule's text colour.
    const base = selector.replace(/:(hover|active|focus-visible)/g, '');
    const baseText = rules
      .filter((r) => r.selector === base)
      .map((r) => role(r.decls.color))
      .find(Boolean);
    if (baseText) pairs.push({ where: selector, text: baseText, bg, large });
  } else if (text && !bg && !MARKS.has(text) && text !== '--wb-on-accent') {
    for (const s of SURFACES) {
      pairs.push({ where: `${selector} (on ${s})`, text, bg: s, large });
    }
  }
}

describe('workbench chrome palette', () => {
  it('finds the pairs', () => {
    expect(pairs.length).toBeGreaterThan(50);
    expect(Object.keys(dark).length).toBe(Object.keys(light).length);
  });

  for (const [name, palette] of Object.entries(palettes)) {
    it(`every text and background pair reaches AA in the ${name} chrome`, () => {
      const failing = pairs
        .map((p) => ({
          ...p,
          ratio: ratio(palette[p.text] ?? '', palette[p.bg] ?? ''),
        }))
        .filter((p) => !(p.ratio >= (p.large ? 3 : 4.5)))
        .map((p) => `${p.where}: ${p.text} on ${p.bg} = ${p.ratio}`);
      expect([...new Set(failing)]).toEqual([]);
    });
  }
});
