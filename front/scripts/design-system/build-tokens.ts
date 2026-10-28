/**
 * Token generator: app/design-system/tokens/tokens.source.json (W3C DTCG)
 * to tokens.css (CSS variables on :root), tokens.ts (typed names) and
 * tokens.meta.json (panel and scanner metadata). Nothing in the app imports
 * them; Storybook and the workbench do.
 *
 *   npm run ds:tokens               write the three files
 *   npm run ds:tokens -- --check    exit 1 if they would change
 *
 * Source shape: `primitive.<category>.<key>` (tier 1) and
 * `semantic.<category>.<key>` (tier 2). A token's CSS name is
 * `--gv-<prefix><key path joined by ->`, where the prefix defaults to
 * `<category>-` and a category group may set `$extensions.gv.prefix` (often
 * "", to keep the design file's names such as `--gv-grey-800`). `$value` is
 * the value the code renders now; `$extensions.gv.backOffice` is a proposed
 * back-office value, shown on the Proposal page only and never written to
 * tokens.css. Either may hold `{tier.category.key}` references, which render
 * as `var(--gv-...)`.
 */
import fs from 'fs';
import path from 'path';

import prettier from 'prettier';

import { checkOutputs, Output } from './check-tokens';
import { TokenMeta } from './scan/schema';

export const CATEGORIES = [
  'color',
  'space',
  'radius',
  'font',
  'text',
  'shadow',
  'motion',
  'z',
  'focus',
] as const;
// `now` is what the code renders; `backOffice` the proposal.
type ValueSet = 'now' | 'backOffice';
const SETS: ValueSet[] = ['now', 'backOffice'];
type Tenant = 'primary' | 'secondary' | 'text';

const TIERS: Record<string, 1 | 2> = { primitive: 1, semantic: 2 };
const TYPES = [
  'color',
  'dimension',
  'fontFamily',
  'shadow',
  'duration',
  'number',
  'border',
];
const TENANTS: Tenant[] = ['primary', 'secondary', 'text'];
const NAME_RE = /^--gv-[a-z0-9-]+$/;
const REF_RE = /\{([^{}]+)\}/g;
const EM_DASH = '\u2014';

export type TokenValue = string | number;
export type GvExtensions = {
  backOffice?: TokenValue;
  legacy?: string[];
  tenant?: Tenant;
  // A runtime input (the city slots, written in Storybook by the theme
  // context); kept out of `t`.
  slot?: boolean;
  prefix?: string;
};
export type TokenNode = {
  $type?: string;
  $value: TokenValue;
  $description?: string;
  $deprecated?: boolean | string;
  $extensions?: { gv?: GvExtensions };
};
export type GroupNode = { [key: string]: any };
export type TokenSource = {
  $schema?: string;
  $description?: string;
  primitive?: Record<string, GroupNode>;
  semantic?: Record<string, GroupNode>;
};

type Token = {
  path: string;
  name: string;
  category: string;
  tier: 1 | 2;
  type: string;
  value: string;
  backOffice?: string;
  description?: string;
  legacy: string[];
  tenant?: Tenant;
  slot: boolean;
  deprecated: boolean;
};

const fail = (msg: string): never => {
  throw new Error(`tokens: ${msg}`);
};

const isToken = (node: unknown): node is TokenNode =>
  typeof node === 'object' && node !== null && '$value' in node;

const flatten = (source: TokenSource): Token[] => {
  const tokens: Token[] = [];
  for (const tierKey of Object.keys(source)) {
    if (tierKey.startsWith('$')) continue;
    const tier = TIERS[tierKey];
    if (!tier) fail(`unknown tier ${tierKey} (expected primitive or semantic)`);
    const groups = (source as Record<string, Record<string, GroupNode>>)[
      tierKey
    ];
    for (const category of Object.keys(groups)) {
      if (category.startsWith('$')) continue;
      if (!(CATEGORIES as readonly string[]).includes(category)) {
        fail(`unknown category ${category} in ${tierKey}`);
      }
      const group = groups[category];
      const prefix: string = group.$extensions?.gv?.prefix ?? `${category}-`;
      const walk = (node: GroupNode, segs: string[], type?: string) => {
        for (const key of Object.keys(node)) {
          if (key.startsWith('$')) continue;
          const child = node[key];
          const here = [...segs, key];
          const p = [tierKey, category, ...here].join('.');
          if (isToken(child)) {
            const gv = child.$extensions?.gv ?? {};
            const name = `--gv-${prefix}${here.join('-')}`;
            if (!NAME_RE.test(name)) {
              fail(`bad name ${name} at ${p} (must match ${NAME_RE})`);
            }
            const tokenType = child.$type ?? type;
            if (!tokenType || !TYPES.includes(tokenType)) {
              fail(`${p} has no valid $type (got ${tokenType})`);
            }
            if (gv.tenant && !TENANTS.includes(gv.tenant)) {
              fail(`${p} has unknown tenant slot ${gv.tenant}`);
            }
            if (gv.tenant && name === `--gv-tenant-${gv.tenant}`) {
              fail(`${p} cannot be a slot of itself`);
            }
            tokens.push({
              path: p,
              name,
              category,
              tier,
              type: tokenType as string,
              value: String(child.$value),
              backOffice:
                gv.backOffice === undefined ? undefined : String(gv.backOffice),
              description: child.$description,
              legacy: gv.legacy ?? [],
              tenant: gv.tenant,
              slot: gv.slot === true,
              deprecated: !!child.$deprecated,
            });
          } else if (typeof child === 'object' && child !== null) {
            walk(child, here, child.$type ?? type);
          } else {
            fail(`${p} is neither a token nor a group`);
          }
        }
      };
      walk(group, [], group.$type);
    }
  }
  return tokens;
};

type Built = {
  tokens: Token[];
  css: (tok: Token) => string;
  resolved: (tok: Token, set: ValueSet) => string;
};

const compile = (source: TokenSource): Built => {
  const tokens = flatten(source);
  const byPath = new Map<string, Token>();
  const byName = new Map<string, Token>();
  for (const tok of tokens) {
    if (byName.has(tok.name)) {
      fail(
        `${tok.name} is defined twice (${byName.get(tok.name)!.path}, ${
          tok.path
        })`
      );
    }
    byName.set(tok.name, tok);
    byPath.set(tok.path, tok);
    for (const text of [tok.value, tok.backOffice, tok.description]) {
      if (text?.includes(EM_DASH)) fail(`${tok.path} contains an em dash`);
    }
  }

  const target = (ref: string, from: Token) =>
    byPath.get(ref) ?? fail(`unknown reference {${ref}} in ${from.path}`);

  const render = (expr: string, from: Token) =>
    expr.replace(REF_RE, (_, ref: string) => `var(${target(ref, from).name})`);

  const memo: Record<ValueSet, Map<Token, string>> = {
    now: new Map(),
    backOffice: new Map(),
  };
  const resolved = (tok: Token, set: ValueSet, stack: Token[] = []): string => {
    const hit = memo[set].get(tok);
    if (hit !== undefined) return hit;
    if (stack.includes(tok)) {
      fail(
        `reference cycle: ${[...stack, tok].map((t) => t.path).join(' -> ')}`
      );
    }
    const next = [...stack, tok];
    const own = set === 'backOffice' && tok.backOffice !== undefined;
    let value: string;
    const input = tok.tenant && !own && byName.get(`--gv-tenant-${tok.tenant}`);
    if (input) {
      value = resolved(input, set, next);
    } else {
      const expr = own ? (tok.backOffice as string) : tok.value;
      value = expr.replace(REF_RE, (_, ref: string) =>
        resolved(target(ref, tok), set, next)
      );
    }
    memo[set].set(tok, value);
    return value;
  };

  const css = (tok: Token): string => {
    const value = render(tok.value, tok);
    return tok.tenant ? `var(--gv-tenant-${tok.tenant}, ${value})` : value;
  };

  // Resolve everything once so bad references and cycles throw here.
  tokens.forEach((tok) => SETS.forEach((m) => resolved(tok, m)));

  return { tokens, css, resolved: (tok, set) => resolved(tok, set) };
};

export const camelKey = (bare: string, category: string): string => {
  const rest = bare.startsWith(`${category}-`)
    ? bare.slice(category.length + 1)
    : bare;
  return rest
    .split('-')
    .map((s, i) => (i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)))
    .join('');
};

type TEntry = { category: string; key: string; value: string };

const tEntries = (tokens: Token[]): TEntry[] => {
  const seen = new Map<string, string>();
  const entries: TEntry[] = [];
  for (const tok of tokens) {
    if (tok.deprecated || tok.slot) continue;
    const key = camelKey(tok.name.slice('--gv-'.length), tok.category);
    const id = `t.${tok.category}.${key}`;
    if (seen.has(id)) {
      fail(`${id} is claimed by both ${seen.get(id)} and ${tok.name}`);
    }
    seen.set(id, tok.name);
    entries.push({ category: tok.category, key, value: `var(${tok.name})` });
  }
  return entries;
};

/** The `t` object tokens.ts exports, for tests and tools. */
export const tObject = (source: TokenSource) => {
  const t: Record<string, Record<string, string>> = {};
  for (const e of tEntries(compile(source).tokens)) {
    (t[e.category] ??= {})[e.key] = e.value;
  }
  return t;
};

const HEADER =
  'Generated by scripts/design-system/build-tokens.ts from tokens.source.json. Do not edit.';

const renderCss = ({ tokens, css }: Built): string => {
  const lines = tokens.map((tok) => `  ${tok.name}: ${css(tok)};\n`);
  return `/* ${HEADER} */\n\n:root {\n${lines.join('')}}\n`;
};

const quote = (s: string) =>
  `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
// Identifiers and plain integers stay bare (the repo lints quote-props).
const objectKey = (k: string) =>
  /^([A-Za-z_$][\w$]*|0|[1-9][0-9]*)$/.test(k) ? k : quote(k);

const renderTs = ({ tokens }: Built): string => {
  const entries = tEntries(tokens);
  const categories = [...new Set(entries.map((e) => e.category))];
  const tBody = categories
    .map((c) => {
      const rows = entries
        .filter((e) => e.category === c)
        .map((e) => `    ${objectKey(e.key)}: ${quote(e.value)},`);
      return `  ${c}: {\n${rows.join('\n')}\n  },`;
    })
    .join('\n');
  const names = tokens.map((tok) => `  | ${quote(tok.name)}`).join('\n');
  const text = [
    `// ${HEADER}`,
    '',
    `export type TokenName =\n${names};`,
    '',
    '// ts-prune-ignore-next',
    `export const t = {\n${tBody}\n} as const;`,
    '',
    '// ts-prune-ignore-next',
    'export const cssVar = (name: TokenName): string => `var(${name})`;',
    '',
  ].join('\n');
  const config =
    prettier.resolveConfig.sync(path.join(ROOT, TOKENS_DIR, 'tokens.ts')) ?? {};
  return prettier.format(text, { ...config, parser: 'typescript' });
};

const renderMeta = ({ tokens, resolved }: Built): TokenMeta[] =>
  tokens.map((tok) => {
    const meta: TokenMeta = {
      name: tok.name,
      category: tok.category,
      tier: tok.tier,
      value: resolved(tok, 'now'),
      legacy: tok.legacy,
      type: tok.type,
      path: tok.path,
    };
    const proposed = resolved(tok, 'backOffice');
    if (proposed !== meta.value) meta.backOffice = proposed;
    if (tok.description) meta.description = tok.description;
    if (tok.tenant) meta.tenant = tok.tenant;
    if (tok.deprecated) meta.deprecated = true;
    return meta;
  });

export const buildTokens = (
  source: TokenSource
): { css: string; ts: string; meta: TokenMeta[] } => {
  const built = compile(source);
  return {
    css: renderCss(built),
    ts: renderTs(built),
    meta: renderMeta(built),
  };
};

// ---------------------------------------------------------------------------
// CLI

const ROOT = path.resolve(__dirname, '..', '..');
const TOKENS_DIR = 'app/design-system/tokens';
const SOURCE = `${TOKENS_DIR}/tokens.source.json`;

export const renderOutputs = (source: TokenSource): Output[] => {
  const { css, ts, meta } = buildTokens(source);
  return [
    { file: `${TOKENS_DIR}/tokens.css`, content: css },
    { file: `${TOKENS_DIR}/tokens.ts`, content: ts },
    {
      file: `${TOKENS_DIR}/tokens.meta.json`,
      content: `${JSON.stringify(meta, null, 2)}\n`,
    },
  ];
};

const summary = (source: TokenSource) => {
  const { meta } = buildTokens(source);
  const t1 = meta.filter((m) => m.tier === 1).length;
  const proposed = meta.filter((m) => m.backOffice !== undefined).length;
  return `${meta.length} tokens (${t1} primitive, ${
    meta.length - t1
  } semantic), ${proposed} with a proposed back-office value`;
};

const main = (argv: string[]): number => {
  const check = argv.includes('--check');
  const unknown = argv.filter((a) => a !== '--check');
  if (unknown.length) console.warn(`ds:tokens: ignoring ${unknown.join(' ')}`);

  let source: TokenSource;
  let outputs: Output[];
  try {
    source = JSON.parse(fs.readFileSync(path.join(ROOT, SOURCE), 'utf8'));
    outputs = renderOutputs(source);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (check) {
      console.error(`ds:tokens --check: ${msg}`);
      return 1;
    }
    console.warn(`ds:tokens warning: ${msg}; keeping the committed outputs`);
    return 0;
  }

  if (check) {
    const problems = checkOutputs(outputs, ROOT);
    if (problems.length) {
      problems.forEach((p) => console.error(`ds:tokens --check: ${p}`));
      console.error('Run `npm run ds:tokens` and commit the result.');
      return 1;
    }
    console.log(`ds:tokens --check: up to date, ${summary(source)}`);
    return 0;
  }

  try {
    for (const { file, content } of outputs) {
      const abs = path.join(ROOT, file);
      const current = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
      if (current !== content) {
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, content);
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`ds:tokens warning: could not write outputs: ${msg}`);
    return 0;
  }
  console.log(`ds:tokens: wrote ${TOKENS_DIR}, ${summary(source)}`);
  return 0;
};

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}
