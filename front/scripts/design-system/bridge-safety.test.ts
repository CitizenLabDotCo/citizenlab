import fs from 'fs';
import path from 'path';

import { findOffenders } from './bridge-safety';

// Theme keys whose value is a CSS variable reference. A var() string cannot
// be parsed, lightened, or used in arithmetic, so no code may do that to them.
// fontFamily is deliberately absent: ModeProvider reads getTheme().fontFamily
// to write --gv-font-family, so bridging it would make the variable refer to
// itself.
const BRIDGED_KEYS = ['borderRadius'];

const FRONT = path.resolve(__dirname, '../..');
const SCAN_DIRS = ['app', '.storybook'].map((d) => path.join(FRONT, d));

const walk = (dir: string, out: string[] = []): string[] => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules') walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.d\.ts$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
};

describe('bridged theme keys stay safe (app)', () => {
  const files = SCAN_DIRS.flatMap((d) => (fs.existsSync(d) ? walk(d) : []));

  it.each(BRIDGED_KEYS)('nothing parses or does maths on %s', (key) => {
    const offenders: string[] = [];
    for (const file of files) {
      const src = fs.readFileSync(file, 'utf8');
      if (!src.includes(key)) continue;
      for (const o of findOffenders(src, key)) {
        offenders.push(
          `${path.relative(FRONT, file)}:${o.line} [${o.label}] ${o.text}`
        );
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('findOffenders', () => {
  const caught = [
    'parseInt(props.theme.borderRadius, 10)',
    'parseFloat(this.props.theme.borderRadius)',
    'Number(props.theme.borderRadius)',
    'rgba(props.theme.borderRadius, 0.5)',
    'parseInt(theme?.borderRadius)',
    'darken(0.1, theme.borderRadius)',
    'lighten(0.1, stylingConsts.borderRadius)',
    'transparentize(0.5, props.theme.borderRadius)',
    'const a = theme.borderRadius + 2',
    'const a = 2 * theme.borderRadius',
    'const a = theme.borderRadius / 2',
    'theme.borderRadius.slice(0, -2)',
    'theme.borderRadius.split("p")',
    'theme.borderRadius.replace("px", "")',
    "const a = theme.borderRadius === '3px'",
    'const a = css`${({ theme }) => theme.borderRadius} * 2`',
    'const a = css`2 * ${(props) => props.theme.borderRadius}`',
    'parseInt(\n  props.theme.borderRadius,\n  10\n)',
    'const a = css`calc(1px + 2) ${theme.borderRadius} * 2`',
  ];
  it.each(caught)('catches %s', (src) => {
    expect(findOffenders(src, 'borderRadius').length).toBeGreaterThan(0);
  });

  const allowed = [
    'const a = css`border-radius: ${theme.borderRadius};`',
    'const a = css`border-radius: ${(props) => props.theme.borderRadius} 0 0;`',
    '<Box borderRadius={stylingConsts.borderRadius} />',
    'const s = { borderRadius: theme.borderRadius }',
    'const a = css`border-radius: calc(${theme.borderRadius} * 2);`',
    'parseInt(theme.borderRadiusLarge)',
    'parseInt(other.borderRadius)',
  ];
  it.each(allowed)('allows %s', (src) => {
    expect(findOffenders(src, 'borderRadius')).toEqual([]);
  });
});
