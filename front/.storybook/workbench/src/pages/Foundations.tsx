import { useEffect, useMemo, useRef, useState } from 'react';

import type { Mode, TokenName } from '@ds/tokens/tokens';

import ChangesDrawer from '../components/ChangesDrawer';
import Icon from '../components/Icon';
import TokenRow, { MODE_LABEL } from '../components/TokenRow';
import { colourGroups, ColourGroup, stepOf } from '../lib/colourGroups';
import { checkPair, PairCheck, resolveTokens } from '../lib/contrast';
import type { TokenMeta } from '../lib/data';
import type { Overrides } from '../lib/overrides';
import { BASE, DEFS } from '../lib/tokenValues';
import { componentLabel, PairUse } from '../lib/usage';
import { useScanIndexes } from '../lib/useScanIndexes';
import { useToolbarHeight } from '../lib/useToolbarHeight';
import { plural } from '../lib/plural';

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
  {
    id: 'shadow',
    label: 'Shadow',
    intro: 'Elevation of cards and menus.',
  },
  {
    id: 'focus',
    label: 'Focus',
    intro: 'The focus ring that keyboard users follow.',
  },
  {
    id: 'motion',
    label: 'Motion',
    intro: 'Durations of transitions.',
  },
  {
    id: 'z',
    label: 'Layers',
    intro: 'Stacking order (z-index).',
  },
];

type Props = {
  category?: string;
  // A token to scroll to and focus (`#/foundations/<category>/<token>`).
  token?: string;
  meta: TokenMeta[];
  mode: Mode;
  onMode: (mode: Mode) => void;
  overrides: Overrides;
  setOverride: (name: TokenName, value: string) => string | undefined;
  reset: (name?: TokenName) => void;
};

const countOf = (meta: TokenMeta[], id: string) =>
  meta.filter((t) => t.category === id).length;

// Today and Redesign as a two-button switch.
const ModeSwitch = ({
  mode,
  onMode,
}: {
  mode: Mode;
  onMode: (mode: Mode) => void;
}) => (
  <div
    className="wb-segmented"
    role="group"
    aria-label="Mode"
    data-testid="wb-foundations-mode"
  >
    {(['today', 'redesign'] as Mode[]).map((m) => (
      <button
        key={m}
        type="button"
        aria-pressed={m === mode}
        onClick={() => onMode(m)}
      >
        {MODE_LABEL[m]}
      </button>
    ))}
  </div>
);

const Badge = ({ ok, label }: { ok: boolean; label: string }) => (
  <span className={ok ? 'wb-pass' : 'wb-fail'}>
    <Icon name={ok ? 'check' : 'cross'} size={12} />
    {label}
    <span className="wb-visually-hidden">{ok ? ' passes' : ' fails'}</span>
  </span>
);

const Verdict = ({
  check,
  text,
  background,
}: {
  check: PairCheck;
  text: string;
  background: string;
}) => (
  <div className="wb-verdict">
    <span
      className="wb-pair-sample"
      style={{ color: text, background }}
      aria-hidden="true"
    >
      Aa
    </span>
    {Number.isNaN(check.ratio) ? (
      <span className="wb-muted">cannot tell</span>
    ) : (
      <span className="wb-verdict-body">
        <span className="wb-ratio">
          {check.ratio.toFixed(2)}
          <span className="wb-ratio-unit">:1</span>
        </span>
        <span className="wb-badges">
          <Badge ok={check.aa} label="AA" />
          <Badge ok={check.aaLarge} label="AA large" />
        </span>
      </span>
    )}
    {check.broken && (
      <span className="wb-broken-note">
        Your edit breaks this pair (was {check.baseRatio.toFixed(2)})
      </span>
    )}
  </div>
);

const TokenChip = ({ name, colour }: { name: string; colour: string }) => (
  <span className="wb-token-chip">
    <span className="wb-dot" style={{ background: colour }} />
    <code>{name}</code>
  </span>
);

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
  const failing = rows.filter((r) => r.failing).length;
  const edited = Object.keys(overrides).length > 0;

  return (
    <section className="wb-pairs" aria-labelledby="wb-pairs-title">
      <h2 id="wb-pairs-title">Text on background: contrast</h2>
      <p className="wb-section-note">
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
            <label className="wb-check">
              <input
                type="checkbox"
                checked={onlyFailing}
                onChange={(e) => setOnlyFailing(e.target.checked)}
              />{' '}
              Only pairs that fail AA in a mode
            </label>
            <span className="wb-pairs-stats">
              <span className="wb-stat-chip">
                <strong>{rows.length}</strong> pairs
              </span>
              <span className="wb-stat-chip wb-stat-chip-fail">
                <strong>{failing}</strong> fail AA in a mode
              </span>
              {broken > 0 && (
                <span className="wb-stat-chip wb-stat-chip-fail">
                  <strong>{broken}</strong> broken by your edits
                </span>
              )}
              {onlyFailing && (
                <span className="wb-muted">
                  showing {shown.length} of {rows.length}
                </span>
              )}
            </span>
          </div>
          <div className="wb-table-wrap">
            <table
              role="table"
              className="wb-table wb-pairs-table"
              data-testid="wb-pairs"
            >
              <thead role="rowgroup">
                <tr role="row">
                  <th scope="col" role="columnheader">
                    Text on background
                  </th>
                  <th scope="col" role="columnheader">
                    Today
                  </th>
                  <th scope="col" role="columnheader">
                    Redesign
                  </th>
                  <th scope="col" role="columnheader">
                    Used in
                  </th>
                </tr>
              </thead>
              <tbody role="rowgroup">
                {shown.map((r) => (
                  <tr
                    role="row"
                    key={`${r.text}|${r.background}`}
                    className={r.broken ? 'wb-pair-broken' : undefined}
                    data-testid="wb-pair-row"
                  >
                    <th scope="row" role="rowheader" className="wb-pair-names">
                      <TokenChip name={r.text} colour={live[mode][r.text]} />
                      <span className="wb-pair-on">on</span>
                      <TokenChip
                        name={r.background}
                        colour={live[mode][r.background]}
                      />
                    </th>
                    {(['today', 'redesign'] as Mode[]).map((m) => (
                      <td role="cell" key={m} data-label={MODE_LABEL[m]}>
                        <Verdict
                          check={r.checks[m]}
                          text={live[m][r.text]}
                          background={live[m][r.background]}
                        />
                      </td>
                    ))}
                    <td
                      role="cell"
                      className="wb-pair-used"
                      data-label="Used in"
                      title={r.components
                        .slice(0, 20)
                        .map(componentLabel)
                        .join('\n')}
                    >
                      {plural(r.components.length, 'component', 'components')}
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

// One ramp of the colour page: a heading with the ramp as a strip of
// swatches, then its rows, folded until the ramp is opened. A swatch opens
// the ramp and puts the cursor in that token's field.
const Ramp = ({
  group,
  open,
  onToggle,
  onPick,
  values,
  edited,
}: {
  group: ColourGroup;
  open: boolean;
  onToggle: () => void;
  onPick: (name: string) => void;
  values: Record<string, string>;
  edited: number;
}) => (
  <tr className="wb-ramp-head" data-testid="wb-ramp">
    <th scope="rowgroup" colSpan={5}>
      <div className="wb-ramp-bar">
        <button
          type="button"
          className="wb-ramp-toggle"
          aria-expanded={open}
          onClick={onToggle}
        >
          <Icon name="chevron" size={16} />
          <span className="wb-ramp-name">{group.label}</span>
          <span className="wb-ramp-count">
            {group.tokens.length}
            {edited > 0 && `, ${edited} edited`}
          </span>
        </button>
        <span className="wb-ramp-strip">
          {group.tokens.map((t) => (
            <button
              key={t.name}
              type="button"
              className="wb-ramp-swatch"
              title={`${t.name}: ${values[t.name] ?? ''}`}
              onClick={() => onPick(t.name)}
            >
              <span
                className="wb-ramp-chip"
                style={{ background: values[t.name] }}
                aria-hidden="true"
              />
              <span className="wb-ramp-step">{stepOf(t.name)}</span>
            </button>
          ))}
        </span>
      </div>
    </th>
  </tr>
);

// The page of one token category; the category tabs move between them.
const Foundations = ({
  category = 'color',
  token,
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

  const groups = useMemo(
    () => (category === 'color' ? colourGroups(tokens) : []),
    [category, tokens]
  );
  // Open ramps: the first one, and any with an edit.
  const [openRamps, setOpenRamps] = useState<Set<string>>(new Set());
  const started = useRef(false);
  const toolbarRef = useToolbarHeight();
  useEffect(() => {
    if (!groups.length) return;
    const first = !started.current;
    started.current = true;
    setOpenRamps((prev) => {
      const next = new Set(prev);
      if (first) next.add(groups[0].id);
      groups.forEach((g) => {
        if (g.tokens.some((t) => overrides[t.name as TokenName] !== undefined))
          next.add(g.id);
      });
      return next.size === prev.size ? prev : next;
    });
  }, [groups, overrides]);
  const toggleRamp = (id: string) =>
    setOpenRamps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const pick = (id: string, name: string) => {
    setOpenRamps((prev) => new Set(prev).add(id));
    window.requestAnimationFrame(() => {
      const input = document.getElementById(`wb-edit-${name.slice(2)}`);
      input?.scrollIntoView({ block: 'center' });
      input?.focus({ preventScroll: true });
    });
  };
  const allOpen = groups.length > 0 && openRamps.size === groups.length;

  // A deep link from the token picker: open the token's ramp, then scroll
  // to its row and focus its input, once per token.
  const shown = useRef<string>();
  useEffect(() => {
    if (!token || shown.current === token || !tokens.length) return;
    shown.current = token;
    const ramp = groups.find((g) => g.tokens.some((t) => t.name === token));
    if (ramp) setOpenRamps((prev) => new Set(prev).add(ramp.id));
    window.requestAnimationFrame(() => {
      const input = document.getElementById(`wb-edit-${token.slice(2)}`);
      input?.scrollIntoView({ block: 'center' });
      input?.focus({ preventScroll: true });
    });
  }, [token, groups, tokens]);

  const count = Object.keys(overrides).length;
  const info = CATEGORIES.find((c) => c.id === category);
  if (!info) {
    return (
      <article className="wb-page">
        <header className="wb-page-head">
          <h1>{`Foundations: ${category}`}</h1>
          <p className="wb-lead">There is no token category of that name.</p>
        </header>
        <a className="wb-button" href="#/foundations/color">
          Go to Colour
        </a>
      </article>
    );
  }
  const scaleId = scale.length ? `wb-scale-${category}` : undefined;
  const differ = tokens.filter(
    (t) => t.values.today !== t.values.redesign
  ).length;

  return (
    <article className="wb-page wb-page-wide">
      <header className="wb-page-head">
        <h1>{info.label}</h1>
        <p className="wb-lead">{info.intro}</p>
      </header>
      <ul className="wb-chips" aria-label="Categories">
        {CATEGORIES.filter((c) => countOf(meta, c.id) > 0).map((c) => (
          <li key={c.id}>
            <a
              href={`#/foundations/${c.id}`}
              aria-current={c.id === category ? 'page' : undefined}
            >
              {c.label}
            </a>
          </li>
        ))}
      </ul>
      <div
        ref={toolbarRef}
        className="wb-toolbar"
        role="toolbar"
        aria-label="Foundations"
      >
        <ModeSwitch mode={mode} onMode={onMode} />
        <span className="wb-toolbar-meta">
          {plural(tokens.length, 'token', 'tokens')}
          {differ > 0 && (
            <>
              {' '}
              <span aria-hidden="true">&middot;</span>{' '}
              <span className="wb-diff-dot" aria-hidden="true" />
              {differ} {differ === 1 ? 'differs' : 'differ'} in the redesign
            </>
          )}
        </span>
        {groups.length > 0 && (
          <button
            type="button"
            className="wb-ramps-all"
            onClick={() =>
              setOpenRamps(
                allOpen ? new Set() : new Set(groups.map((g) => g.id))
              )
            }
          >
            {allOpen ? 'Fold all' : 'Open all'}
          </button>
        )}
        <button
          type="button"
          className="wb-changes-toggle"
          data-testid="wb-changes-toggle"
          aria-expanded={drawer}
          onClick={() => setDrawer((d) => !d)}
        >
          <Icon name="edit" size={16} />
          Changes
          <span className={count > 0 ? 'wb-count wb-count-on' : 'wb-count'}>
            {count}
          </span>
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
        <div className="wb-empty wb-empty-small" data-testid="wb-tokens-empty">
          <div className="wb-empty-text">
            <h2>No tokens in this category yet</h2>
            <p className="wb-muted">
              When the token source gains {info.label.toLowerCase()} tokens,
              they show up here.
            </p>
          </div>
        </div>
      ) : (
        <div className="wb-table-wrap wb-tokens-wrap">
          <table
            role="table"
            className="wb-table wb-tokens"
            data-testid="wb-tokens"
          >
            <caption className="wb-visually-hidden">
              {`${info.label} tokens`}
            </caption>
            <thead role="rowgroup">
              <tr role="row">
                <th scope="col" role="columnheader">
                  Preview
                </th>
                <th scope="col" role="columnheader">
                  Token
                </th>
                <th scope="col" role="columnheader">
                  Value
                </th>
                <th scope="col" role="columnheader">
                  Edit
                </th>
                <th scope="col" role="columnheader">
                  Used
                </th>
              </tr>
            </thead>
            {groups.map((g) => {
              const open = openRamps.has(g.id);
              return (
                <tbody
                  role="rowgroup"
                  key={g.id}
                  className="wb-ramp"
                  data-open={open || undefined}
                >
                  <Ramp
                    group={g}
                    open={open}
                    onToggle={() => toggleRamp(g.id)}
                    onPick={(name) => pick(g.id, name)}
                    values={live[mode]}
                    edited={
                      g.tokens.filter(
                        (t) => overrides[t.name as TokenName] !== undefined
                      ).length
                    }
                  />
                  {g.tokens.map((t) => (
                    <TokenRow
                      key={t.name}
                      token={t}
                      meta={meta}
                      mode={mode}
                      override={overrides[t.name as TokenName]}
                      live={live}
                      usage={indexes.usage.get(t.name)}
                      hasScan={indexes.hasScan}
                      scaleId={scaleId}
                      onSet={setOverride}
                      onReset={reset}
                      folded={!open}
                    />
                  ))}
                </tbody>
              );
            })}
            {groups.length === 0 && (
              <tbody role="rowgroup">
                {tokens.map((t) => (
                  <TokenRow
                    key={t.name}
                    token={t}
                    meta={meta}
                    mode={mode}
                    override={overrides[t.name as TokenName]}
                    live={live}
                    usage={indexes.usage.get(t.name)}
                    hasScan={indexes.hasScan}
                    scaleId={scaleId}
                    onSet={setOverride}
                    onReset={reset}
                  />
                ))}
              </tbody>
            )}
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
