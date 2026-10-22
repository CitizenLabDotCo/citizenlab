import fs from 'fs';
import path from 'path';

// Theme keys whose value is a CSS variable reference. A var() string cannot
// be parsed, lightened, or used in arithmetic, so no code may do that to them.
// fontFamily is deliberately absent: ModeProvider reads getTheme().fontFamily
// to write --gv-font-family, so bridging it would make the variable refer to
// itself.
const BRIDGED_KEYS = ['borderRadius'];

const APP_DIR = path.resolve(__dirname, '../../app');

const walk = (dir: string, out: string[] = []): string[] => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
};

// Matches both `theme.<key>` and `stylingConsts.<key>`.
const ref = (key: string) => `(?:theme|stylingConsts)\\.${key}`;

const offenderPatterns = (key: string): [string, RegExp][] => [
  ['rgba(', new RegExp(`rgba\\(\\s*${ref(key)}`)],
  ['transparentize(', new RegExp(`transparentize\\([^)]*${ref(key)}`)],
  ['darken(', new RegExp(`darken\\([^)]*${ref(key)}`)],
  ['lighten(', new RegExp(`lighten\\([^)]*${ref(key)}`)],
  ['parseInt(', new RegExp(`parseInt\\(\\s*${ref(key)}`)],
  ['parseFloat(', new RegExp(`parseFloat\\(\\s*${ref(key)}`)],
  ['Number(', new RegExp(`Number\\(\\s*${ref(key)}`)],
  ['string replace', new RegExp(`${ref(key)}\\s*\\.\\s*replace\\(`)],
  ['string compare', new RegExp(`${ref(key)}\\s*[!=]==?\\s*['"\`]`)],
  [
    'template arithmetic',
    new RegExp(`\\$\\{[^}]*${ref(key)}\\}\\s*[*/+-]\\s*[\\d(]`),
  ],
  ['arithmetic', new RegExp(`${ref(key)}\\s*[*/]\\s*[\\d(]`)],
];

describe('bridged theme keys stay safe', () => {
  const files = walk(APP_DIR).filter((f) => !/\.test\.tsx?$/.test(f));

  it.each(BRIDGED_KEYS)('nothing parses or does maths on %s', (key) => {
    const offenders: string[] = [];
    for (const file of files) {
      fs.readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          for (const [label, re] of offenderPatterns(key)) {
            if (re.test(line)) {
              offenders.push(
                `${path.relative(APP_DIR, file)}:${
                  i + 1
                } [${label}] ${line.trim()}`
              );
            }
          }
        });
    }
    expect(offenders).toEqual([]);
  });
});
