import { useEffect, useMemo, useState } from 'react';

import tokensCss from '@ds/tokens/tokens.css?raw';
import type { Mode, TokenName } from '@ds/tokens/tokens';

import ChangesDrawer from '../components/ChangesDrawer';
import TokenRow, { MODE_LABEL } from '../components/TokenRow';
import {
  checkPair,
  parseTokenCss,
  PairCheck,
  resolveTokens,
} from '../lib/contrast';
import { loadScan, ScanOutput, TokenMeta } from '../lib/data';
import type { Overrides } from '../lib/overrides';
import {
  buildPairs,
  buildUsage,
  componentLabel,
  PairUse,
  TokenUsage,
} from '../lib/usage';

type Category = { id: string; label: string; intro: string };

export const CATEGORIES: Category[] = [
  {
    id: 'color',
    label: 'Colour',
    intro:
      'Every colour token. Below the list, the text and background pairs that components use, with their contrast.',
  },
  {
    id: 'space',
    label: 'Space',
    intro: 'Padding, gaps and widths. The scale steps are multiples of 4px.',
  },
  {
    id: 'radius',
    label: 'Radius',
    intro: 'Corner rounding of controls, panels and pills.',
  },
  {
    id: 'font',
    label: 'Font',
    intro: 'Font families and the font size ladder.',
  },
  {
    id: 'text',
    label: 'Text styles',
    intro: 'Size, line height, weight and letter spacing of each text role.',
  },
  { id: 'shadow', label: 'Shadow', intro: 'Elevation of cards and menus.' },
  {
    id: 'focus',
    label: 'Focus',
    intro: 'The focus ring that keyboard users follow.',
  },
  { id: 'motion', label: 'Motion', intro: 'Durations of transitions.' },
  { id: 'z', label: 'Layers', intro: 'Stacking order (z-index).' },
];

// The token CSS, parsed once: raw definitions per mode, and their values
// without any edit.
const DEFS = parseTokenCss(tokensCss);
const BASE = resolveTokens(DEFS);

type Props = {
  category?: string;
  meta: TokenMeta[];
  mode: Mode;
  onMode: (mode: Mode) => void;
  overrides: Overrides;
  setOverride: (name: TokenName, value: string) => string | undefined;
  reset: (name?: TokenName) => void;
};

// The scan once per page load, and its indexes once per scan.
type Indexes = {
  loaded: boolean;
  hasScan: boolean;
  usage: Map<string, TokenUsage>;
  pairs: PairUse[];
};
const NO_SCAN: Omit<Indexes, 'loaded'> = {
  hasScan: false,
  usage: new Map(),
  pairs: [],
};

// Built once per scan and kept across page visits; pairs only when a page
// shows them (the Colour page).
const built = new WeakMap<
  ScanOutput,
  { meta: TokenMeta[]; usage: Map<string, TokenUsage>; pairs?: PairUse[] }
>();
const indexesOf = (scan: ScanOutput, meta: TokenMeta[], withPairs: boolean) => {
  let entry = built.get(scan);
  if (!entry || entry.meta !== meta) {
    entry = { meta, usage: buildUsage(scan, meta) };
    built.set(scan, entry);
  }
  if (withPairs && !entry.pairs) entry.pairs = buildPairs(scan, meta);
  return { usage: entry.usage, pairs: entry.pairs ?? [] };
};

const useScanIndexes = (meta: TokenMeta[], withPairs: boolean): Indexes => {
  const [scan, setScan] = useState<ScanOutput | undefined>();
  useEffect(() => {
    let live = true;
    loadScan().then((s) => live && setScan(s));
    return () => {
      live = false;
    };
  }, []);
  return useMemo(() => {
    if (!scan || scan.findings.length === 0) {
      return { ...NO_SCAN, loaded: !!scan };
    }
    return { loaded: true, hasScan: true, ...indexesOf(scan, meta, withPairs) };
  }, [scan, meta, withPairs]);
};

const Index = ({ meta }: { meta: TokenMeta[] }) => (
  <article className="wb-page">
    <h1>Foundations</h1>
    <p>
      The design tokens, one page per kind. Each page lists the tokens with
      their value today and in the redesign, the old names the code still uses,
      and how often the code reads them. Edit a value to try it out: the change
      shows on every Foundations page and in the canvas, and you can share it as
      a link.
    </p>
    <ul className="wb-category-list" data-testid="wb-categories">
      {CATEGORIES.map((c) => {
        const n = meta.filter((t) => t.category === c.id).length;
        return (
          <li key={c.id}>
            <a href={`#/foundations/${c.id}`}>{c.label}</a>{' '}
            <span className="wb-muted">
              {n} {n === 1 ? 'token' : 'tokens'}. {c.intro}
            </span>
          </li>
        );
      })}
    </ul>
  </article>
);

const Verdict = ({ check }: { check: PairCheck }) => {
  if (Number.isNaN(check.ratio)) {
    return <span className="wb-muted">cannot tell</span>;
  }
  return (
    <span className="wb-verdict">
      <strong>{check.ratio.toFixed(2)}</strong>
      <span className={check.aa ? 'wb-pass' : 'wb-fail'}>
        {check.aa ? 'AA' : 'fails AA'}
      </span>
      <span className={check.aaLarge ? 'wb-pass' : 'wb-fail'}>
        {check.aaLarge ? 'AA large' : 'fails AA large'}
      </span>
      {check.broken && (
        <span className="wb-broken-note">
          Your edit breaks this pair (was {check.baseRatio.toFixed(2)})
        </span>
      )}
    </span>
  );
};

type PairRow = PairUse & {
  checks: Record<Mode, PairCheck>;
  broken: boolean;
  failing: boolean;
};

const PairsTable = ({
  pairs,
  mode,
  live,
  overrides,
  loaded,
}: {
  pairs: PairUse[];
  mode: Mode;
  live: Record<Mode, Record<string, string>>;
  overrides: Overrides;
  loaded: boolean;
}) => {
  const [onlyFailing, setOnlyFailing] = useState(false);
  const rows: PairRow[] = useMemo(() => {
    const out = pairs.map((p) => {
      const checks = {
        today: checkPair(p.text, p.background, BASE.today, live.today),
        redesign: checkPair(p.text, p.background, BASE.redesign, live.redesign),
      };
      return {
        ...p,
        checks,
        broken: checks.today.broken || checks.redesign.broken,
        failing: !checks.today.aa || !checks.redesign.aa,
      };
    });
    // Broken by an edit first, then the order of buildPairs (most used).
    return out.sort((a, b) => Number(b.broken) - Number(a.broken));
  }, [pairs, live]);
  const shown = onlyFailing ? rows.filter((r) => r.failing) : rows;
  const broken = rows.filter((r) => r.broken).length;
  const edited = Object.keys(overrides).length > 0;

  return (
    <section className="wb-pairs" aria-labelledby="wb-pairs-title">
      <h2 id="wb-pairs-title">Text on background: contrast</h2>
      <p className="wb-muted">
        Pairs inferred from usage: for each component, every text colour it
        reads against every background colour it reads. The scan does not see
        which element sits on which, so some pairs never meet on screen. Ratios
        follow WCAG 2.2: AA needs 4.5 for normal text and 3 for large text
        (24px, or 18.7px bold). Checked against both modes
        {edited ? ', with your edits applied' : ''}. Platform colours use the
        default pink (#ef0071), not the city picked in the toolbar.
      </p>
      {!loaded ? (
        <p className="wb-muted">Loading the scan...</p>
      ) : pairs.length === 0 ? (
        <p className="wb-muted" data-testid="wb-pairs-empty">
          No pairs: the scan (design-scan.json) is missing from this build or
          has no colour reads.
        </p>
      ) : (
        <>
          <div className="wb-pairs-bar">
            <label>
              <input
                type="checkbox"
                checked={onlyFailing}
                onChange={(e) => setOnlyFailing(e.target.checked)}
              />{' '}
              Only pairs that fail AA in a mode
            </label>
            <span className="wb-muted">
              {shown.length} of {rows.length} pairs
              {broken > 0 ? `, ${broken} broken by your edits` : ''}
            </span>
          </div>
          <div className="wb-table-wrap">
            <table className="wb-table" data-testid="wb-pairs">
              <thead>
                <tr>
                  <th scope="col">Sample ({MODE_LABEL[mode]})</th>
                  <th scope="col">Text</th>
                  <th scope="col">Background</th>
                  <th scope="col">Today</th>
                  <th scope="col">Redesign</th>
                  <th scope="col">Used in</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr
                    key={`${r.text}|${r.background}`}
                    className={r.broken ? 'wb-pair-broken' : undefined}
                    data-testid="wb-pair-row"
                  >
                    <td>
                      <span
                        className="wb-pair-sample"
                        style={{
                          color: live[mode][r.text],
                          background: live[mode][r.background],
                        }}
                      >
                        Aa
                      </span>
                    </td>
                    <td>
                      <code>{r.text}</code>
                    </td>
                    <td>
                      <code>{r.background}</code>
                    </td>
                    <td>
                      <Verdict check={r.checks.today} />
                    </td>
                    <td>
                      <Verdict check={r.checks.redesign} />
                    </td>
                    <td
                      title={r.components
                        .slice(0, 20)
                        .map(componentLabel)
                        .join('\n')}
                    >
                      {r.components.length}{' '}
                      {r.components.length === 1 ? 'component' : 'components'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};

// The page of one token category, or the list of categories.
const Foundations = ({
  category,
  meta,
  mode,
  onMode,
  overrides,
  setOverride,
  reset,
}: Props) => {
  const indexes = useScanIndexes(meta, category === 'color');
  const [drawer, setDrawer] = useState(false);
  const live = useMemo(() => resolveTokens(DEFS, overrides), [overrides]);
  const tokens = useMemo(
    () => meta.filter((t) => t.category === category),
    [meta, category]
  );
  const scale = useMemo(
    () => [
      ...new Set(tokens.filter((t) => t.tier === 1).map((t) => t.values[mode])),
    ],
    [tokens, mode]
  );

  if (!category) return <Index meta={meta} />;
  const info = CATEGORIES.find((c) => c.id === category);
  if (!info) {
    return (
      <article className="wb-page">
        <h1>{`Foundations: ${category}`}</h1>
        <p>
          There is no token category of that name.{' '}
          <a href="#/foundations">See all categories</a>.
        </p>
      </article>
    );
  }
  const count = Object.keys(overrides).length;
  const scaleId = scale.length ? `wb-scale-${category}` : undefined;

  return (
    <article className="wb-page wb-page-wide">
      <h1>{info.label}</h1>
      <p className="wb-muted">{info.intro}</p>
      <div className="wb-toolbar" role="toolbar" aria-label="Foundations">
        <label className="wb-toolbar-field">
          <span>Mode</span>
          <select
            data-testid="wb-foundations-mode"
            value={mode}
            onChange={(e) => onMode(e.target.value as Mode)}
          >
            <option value="today">Today</option>
            <option value="redesign">Redesign</option>
          </select>
        </label>
        <button
          type="button"
          className="wb-changes-toggle"
          data-testid="wb-changes-toggle"
          aria-expanded={drawer}
          onClick={() => setDrawer((d) => !d)}
        >
          Changes ({count})
        </button>
      </div>
      {drawer && (
        <ChangesDrawer
          meta={meta}
          mode={mode}
          overrides={overrides}
          onReset={reset}
          onClose={() => setDrawer(false)}
        />
      )}
      {scaleId && (
        <datalist id={scaleId}>
          {scale.map((v) => (
            <option key={v} value={v} />
          ))}
        </datalist>
      )}
      {tokens.length === 0 ? (
        <p data-testid="wb-tokens-empty">No tokens in this category yet.</p>
      ) : (
        <div className="wb-table-wrap">
          <table className="wb-table" data-testid="wb-tokens">
            <caption className="wb-visually-hidden">
              {`${info.label} tokens`}
            </caption>
            <thead>
              <tr>
                <th scope="col">
                  <span className="wb-visually-hidden">Preview</span>
                </th>
                <th scope="col">Token</th>
                <th scope="col">{MODE_LABEL[mode]}</th>
                <th scope="col">
                  {MODE_LABEL[mode === 'today' ? 'redesign' : 'today']}
                </th>
                <th scope="col">Edit</th>
                <th scope="col">Used</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <TokenRow
                  key={t.name}
                  token={t}
                  meta={meta}
                  mode={mode}
                  override={overrides[t.name as TokenName]}
                  live={live[mode][t.name] || t.values[mode]}
                  usage={indexes.usage.get(t.name)}
                  hasScan={indexes.hasScan}
                  scaleId={scaleId}
                  onSet={setOverride}
                  onReset={reset}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {category === 'color' && (
        <PairsTable
          pairs={indexes.pairs}
          mode={mode}
          live={live}
          overrides={overrides}
          loaded={indexes.loaded}
        />
      )}
    </article>
  );
};

export default Foundations;
