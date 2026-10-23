import {
  CSSProperties,
  memo,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { Mode, TokenName } from '@ds/tokens/tokens';

import type { TokenMeta } from '../lib/data';
import { nudgeValue, NudgeOptions, stepOfKey } from '../lib/nudge';
import { kindOf } from '../lib/overrides';
import { parseShadow } from '../lib/shadow';
import { DEFS } from '../lib/tokenValues';
import type { TokenUsage } from '../lib/usage';
import { plural } from '../lib/plural';

import Icon, { IconName } from './Icon';
import ShadowEditor from './ShadowEditor';
import { ColourPicker, toHex6, useTokenEdit } from './tokenEdit';

export const MODE_LABEL: Record<Mode, string> = {
  today: 'Today',
  redesign: 'Redesign',
};

type Live = Record<Mode, Record<string, string>>;

type Props = {
  token: TokenMeta;
  meta: TokenMeta[];
  mode: Mode;
  // The session's override of this token, if any.
  override?: string;
  // Every token's value per mode with the overrides applied, var() chains
  // followed: what the previews show.
  live: Live;
  usage?: TokenUsage;
  // False when the scan is not loaded, so usage reads "no scan".
  hasScan: boolean;
  scaleId?: string;
  onSet: (name: TokenName, value: string) => string | undefined;
  onReset: (name: TokenName) => void;
  // Extras of the Tokens panel: a chip next to the name, and a last cell
  // (what the story and the code do with the token, the heal).
  badge?: ReactNode;
  footer?: ReactNode;
  // Folded under its ramp's heading on the colour page.
  folded?: boolean;
};

// Hex values read in one case (the sources mix #E0E0E0 and #ffffff).
const shown = (value: string) =>
  /^#[0-9a-f]{3,8}$/i.test(value) ? value.toLowerCase() : value;

// Widest a space bar is drawn; longer values are cut with a fade.
const BAR_MAX = 200;

const px = (value: string) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

// The text role a type token belongs to (--gv-type-h1-lh: h1).
const roleOf = (name: string) => /^--gv-type-([a-z0-9]+)-/.exec(name)?.[1];

// A dot that travels at the token's duration: once when the row scrolls
// into view (there and back), and again on hover.
const MotionPreview = ({ value }: { value: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [at, setAt] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let back = 0;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      setAt(true);
      back = window.setTimeout(() => setAt(false), 900);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(back);
    };
  }, []);
  return (
    <span
      ref={ref}
      className="wb-pv wb-pv-motion"
      data-at={at || undefined}
      style={{ '--wb-duration': value } as CSSProperties}
    >
      <span />
    </span>
  );
};

// A picture of the token, drawn with one mode's live value. `all` holds the
// other tokens of that mode, for previews that need a neighbour (the size
// of a text role, the colour of the focus ring).
export const Preview = ({
  token,
  value,
  all,
}: {
  token: TokenMeta;
  value: string;
  all: Record<string, string>;
}) => {
  const kind = token.type ?? '';
  const name = token.name;
  const role = roleOf(name);
  const roleSize = role ? all[`--gv-type-${role}-size`] : undefined;
  const roleWeight = role
    ? (all[`--gv-type-${role}-weight`] as CSSProperties['fontWeight'])
    : undefined;

  if (token.category === 'focus') {
    const ring: CSSProperties = {
      outline: `${all['--gv-focus-width']} solid ${all['--gv-focus-color']}`,
      outlineOffset: all['--gv-focus-offset'],
    };
    if (/-width$/.test(name)) ring.outlineWidth = value;
    else if (/-offset$/.test(name)) ring.outlineOffset = value;
    else if (/-color$/.test(name)) ring.outlineColor = value;
    else if (kind === 'border') ring.outline = value;
    else if (kind === 'shadow') ring.boxShadow = value;
    return (
      <span className="wb-pv wb-pv-focus">
        <span style={ring}>Button</span>
      </span>
    );
  }
  if (token.category === 'color' || kind === 'color') {
    return (
      <span className="wb-pv wb-pv-swatch" style={{ background: value }} />
    );
  }
  if (token.category === 'space') {
    const n = px(value);
    // Past BAR_MAX the bar is cut; the label says how long it really is.
    return (
      <span className="wb-pv wb-pv-space">
        {n > 0 && (
          <span
            className={n > BAR_MAX ? 'wb-pv-cut' : undefined}
            style={{ width: Math.min(n, BAR_MAX) }}
          >
            {n > BAR_MAX && <span>{value}</span>}
          </span>
        )}
      </span>
    );
  }
  if (token.category === 'radius') {
    return (
      <span className="wb-pv wb-pv-radius">
        <span style={{ borderRadius: value }} />
      </span>
    );
  }
  if (kind === 'shadow') {
    return (
      <span className="wb-pv wb-pv-shadow">
        <span style={{ boxShadow: value }} />
      </span>
    );
  }
  if (token.category === 'motion') return <MotionPreview value={value} />;
  let style: CSSProperties = {};
  let text = 'Aa';
  if (kind === 'fontFamily') {
    style = { fontFamily: value, fontSize: 28 };
    text = 'Aa Gg';
  } else if (kind === 'number' && /weight/.test(name)) {
    style = { fontWeight: value as CSSProperties['fontWeight'], fontSize: 24 };
    text = 'Aa';
  } else if (/-ls$/.test(name)) {
    style = {
      letterSpacing: value,
      fontSize: roleSize,
      fontWeight: roleWeight,
    };
    text = 'Spacing';
  } else if (/-lh$/.test(name)) {
    return (
      <span
        className="wb-pv wb-pv-lh"
        style={{
          lineHeight: value,
          fontSize: roleSize,
          fontWeight: roleWeight,
          backgroundSize: `100% ${value}`,
        }}
      >
        Line one
        <br />
        Line two
      </span>
    );
  } else if (token.category === 'font' || token.category === 'text') {
    style = { fontSize: value, fontWeight: roleWeight };
    text = role ? 'Ag' : 'Aa';
  } else {
    return <span className="wb-pv wb-pv-none" />;
  }
  return (
    <span className="wb-pv wb-pv-type" style={style}>
      {text}
    </span>
  );
};

// The glyph the Design tab draws for the same kind of value.
const glyphOf = (t: TokenMeta): IconName | undefined => {
  if (t.category === 'radius') return 'radius';
  if (t.category === 'space') return 'width';
  if (t.type === 'shadow') return 'shadow';
  if (/-ls$/.test(t.name)) return 'letter-spacing';
  if (/-lh$/.test(t.name)) return 'line-height';
  if (/weight/.test(t.name)) return 'font-weight';
  if (t.category === 'font' || t.category === 'text') {
    return t.type === 'fontFamily' ? 'text' : 'font-size';
  }
  if (t.type === 'border') return 'stroke';
  if (t.type === 'dimension') return 'stroke-width';
  return undefined;
};

// How the arrow keys step the token: a bare 0 of a length takes px, and
// nothing below 0 where a negative makes no sense (letter spacing, an
// outline offset and a stacking order may go below; of a shadow only the
// blur, its third number, may not). A weight steps by 100 within 100 to
// 900, a unitless line height by 0.01.
const nudgeOf = (t: TokenMeta): NudgeOptions => {
  const kind = kindOf(t);
  const unit =
    kind === 'length' || kind === 'shadow' || kind === 'border' ? 'px' : '';
  if (kind === 'number' && /weight/.test(t.name)) {
    return { by: 100, min: 100, max: 900 };
  }
  if (/-lh$/.test(t.name)) return { unit, min: 0, fine: true };
  if (kind === 'shadow') {
    return { unit, min: (i: number) => (i === 2 ? 0 : undefined) };
  }
  if (t.category === 'z' || /-ls$|offset/.test(t.name)) return { unit };
  return { unit, min: 0 };
};

// The tokens a definition reads (var(--gv-…)), those Foundations lists.
const refsOf = (raw: string, meta: TokenMeta[]): TokenMeta[] => {
  const names = [...raw.matchAll(/var\(\s*(--gv-[a-z0-9-]+)/g)].map(
    (m) => m[1]
  );
  return [...new Set(names)]
    .map((n) => meta.find((t) => t.name === n))
    .filter((t): t is TokenMeta => !!t);
};

const linkOf = (t: TokenMeta) => `#/foundations/${t.category}/${t.name}`;

// The value of a token that reads another: a pill that links to the
// source when it is one var(), the value with links to its parts when it
// is built from several. Detach gives it a field of its own.
const AliasValue = ({
  id,
  token,
  raw,
  refs,
  value,
  onDetach,
}: {
  id: string;
  token: TokenMeta;
  raw: string;
  refs: TokenMeta[];
  value: string;
  onDetach: () => void;
}) => {
  const hex =
    token.category === 'color' || token.type === 'color'
      ? toHex6(value)
      : undefined;
  const lead = hex ? (
    <span
      className="wb-vf-swatch"
      style={{ background: value }}
      aria-hidden="true"
    />
  ) : (
    <Icon name="link" size={14} />
  );
  const single = refs.length === 1 && /^var\([^()]*\)$/.test(raw.trim());
  const detach = (
    <button
      type="button"
      className="wb-vf-side wb-vf-detach"
      data-testid="wb-token-detach"
      aria-label={`Detach ${token.name} to give it its own value`}
      onClick={onDetach}
    >
      <Icon name="detach" size={14} />
    </button>
  );
  if (single) {
    const source = refs[0];
    return (
      <div
        className="wb-vf wb-vf-pill wb-tf"
        data-testid="wb-token-alias"
        data-source={source.name}
      >
        <a
          id={id}
          className="wb-vf-body"
          href={linkOf(source)}
          aria-label={`${token.name} reads ${source.name}, ${shown(
            value
          )}. Edit ${source.name}`}
        >
          {lead}
          <span className="wb-vf-name">{source.name.slice(5)}</span>
          <span className="wb-vf-muted">{shown(value)}</span>
        </a>
        {detach}
      </div>
    );
  }
  return (
    <>
      <div className="wb-vf wb-tf wb-tf-built" data-testid="wb-token-alias">
        <span className="wb-vf-body" id={id} tabIndex={-1}>
          {lead}
          <span className="wb-vf-text">{shown(value)}</span>
        </span>
        {detach}
      </div>
      <div className="wb-tf-notes">
        <span>
          from{' '}
          {refs.map((r, i) => (
            <span key={r.name}>
              {i > 0 && ', '}
              <a href={linkOf(r)}>{r.name.slice(5)}</a>
            </span>
          ))}
        </span>
      </div>
    </>
  );
};

// One token: picture, name, both modes, the editor and what the scan says
// about its use.
const TokenRow = ({
  token,
  meta,
  mode,
  override,
  live,
  usage,
  hasScan,
  scaleId,
  onSet,
  onReset,
  badge,
  footer,
  folded,
}: Props) => {
  const name = token.name as TokenName;
  const { current, draft, setDraft, commit, apply, feedback, setFeedback } =
    useTokenEdit({
      name,
      base: token.values[mode],
      override,
      meta,
      mode,
      onSet,
      onReset,
    });

  const value = live[mode][name] || token.values[mode];
  const differs =
    (live.today[name] || token.values.today) !==
    (live.redesign[name] || token.values.redesign);
  const base = token.values[mode];
  const edited = override !== undefined;
  const other: Mode = mode === 'today' ? 'redesign' : 'today';
  const hex =
    token.category === 'color' || token.type === 'color'
      ? toHex6(value)
      : undefined;
  const inputId = `wb-edit-${name.slice(2)}`;
  const glyph = glyphOf(token);

  // A token that reads others in this mode is edited at its source; Detach
  // gives it a value of its own.
  const raw = DEFS[mode][name] ?? '';
  const refs = useMemo(() => refsOf(raw, meta), [raw, meta]);
  const [detached, setDetached] = useState(false);
  const aliased = !edited && !detached && refs.length > 0;

  const [layersOpen, setLayersOpen] = useState(false);
  const layers = token.type === 'shadow' ? parseShadow(current) : null;

  return (
    <tr
      role="row"
      className={edited ? 'wb-token-edited' : undefined}
      data-testid="wb-token-row"
      data-token={name}
      hidden={folded}
    >
      <td role="cell" className="wb-token-preview">
        {differs ? (
          <span className="wb-compare" aria-hidden="true">
            {(['today', 'redesign'] as Mode[]).map((m) => (
              <span
                key={m}
                className={m === mode ? 'wb-compare-on' : undefined}
              >
                <Preview
                  token={token}
                  value={live[m][name] || token.values[m]}
                  all={live[m]}
                />
                <span className="wb-compare-label">{MODE_LABEL[m]}</span>
              </span>
            ))}
          </span>
        ) : (
          <span aria-hidden="true">
            <Preview token={token} value={value} all={live[mode]} />
          </span>
        )}
      </td>
      <th scope="row" role="rowheader" className="wb-token-name">
        <code>{name}</code>
        <span className="wb-tags">
          {badge}
          {token.tier === 1 && <span className="wb-tag">scale</span>}
          {token.deprecated && (
            <span className="wb-tag wb-tag-warn">deprecated</span>
          )}
        </span>
        {token.description && (
          <div className="wb-token-note" title={token.description}>
            {token.description}
          </div>
        )}
        {token.legacy.length > 0 && (
          <details className="wb-legacy">
            <summary>
              {token.legacy.length === 1
                ? '1 legacy name'
                : `${token.legacy.length} legacy names`}
            </summary>
            <ul>
              {token.legacy.map((l) => (
                <li key={l}>
                  <code>{l}</code>
                </li>
              ))}
            </ul>
          </details>
        )}
      </th>
      <td role="cell" className="wb-token-values" data-label="Value">
        {aliased ? (
          <AliasValue
            id={inputId}
            token={token}
            raw={raw}
            refs={refs}
            value={value}
            onDetach={() => {
              setDetached(true);
              window.requestAnimationFrame(() =>
                document.getElementById(inputId)?.focus()
              );
            }}
          />
        ) : (
          <div
            className={edited ? 'wb-vf wb-tf wb-tf-edited' : 'wb-vf wb-tf'}
            title={edited ? `Original: ${shown(base)}` : undefined}
          >
            <span className="wb-vf-body">
              {hex ? (
                <span className="wb-tf-swatch">
                  <ColourPicker
                    label={`Pick a colour for ${name}`}
                    value={hex}
                    onPreview={setDraft}
                    onCommit={commit}
                  />
                </span>
              ) : (
                glyph && <Icon name={glyph} size={14} />
              )}
              <input
                id={inputId}
                data-testid="wb-token-input"
                aria-label={`Value of ${name}`}
                value={draft}
                list={scaleId}
                spellCheck={false}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={(e) => commit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commit(e.currentTarget.value);
                  if (e.key === 'Escape') setDraft(current);
                  const step = stepOfKey(e);
                  if (!step) return;
                  const el = e.currentTarget;
                  const next = nudgeValue(el.value, step, {
                    caret: el.selectionStart ?? undefined,
                    ...nudgeOf(token),
                  });
                  if (!next) return;
                  e.preventDefault();
                  apply(next.value);
                  // The stepped number stays selected, for the next step.
                  window.requestAnimationFrame(() =>
                    el.setSelectionRange(next.start, next.end)
                  );
                }}
              />
            </span>
            {layers && (
              <button
                type="button"
                className="wb-vf-side"
                data-testid="wb-shadow-toggle"
                aria-label={`Shadow layers of ${name}`}
                aria-expanded={layersOpen}
                onClick={() => setLayersOpen((o) => !o)}
              >
                <Icon name="sliders" size={14} />
              </button>
            )}
            {edited && (
              <button
                type="button"
                className="wb-vf-side"
                data-testid="wb-token-reset"
                aria-label={`Reset ${name} to ${shown(base)}`}
                onClick={() => {
                  onReset(name);
                  setFeedback(undefined);
                  setDetached(false);
                }}
              >
                <Icon name="reset" size={14} />
              </button>
            )}
          </div>
        )}
        {(edited || differs) && (
          <div className="wb-tf-notes">
            {edited && (
              <span data-testid="wb-token-was">
                was <code>{shown(base)}</code>
              </span>
            )}
            {differs && (
              <span>
                <span className="wb-diff-dot" aria-hidden="true" />
                {MODE_LABEL[other]} <code>{shown(token.values[other])}</code>
              </span>
            )}
          </div>
        )}
        {feedback && (
          <div
            className={`wb-token-feedback wb-token-feedback-${feedback.kind}`}
            role={feedback.kind === 'error' ? 'alert' : 'status'}
          >
            {feedback.text}
          </div>
        )}
        {layers && layersOpen && !aliased && (
          <ShadowEditor name={name} value={current} onApply={apply} />
        )}
      </td>
      <td role="cell" className="wb-token-usage" data-label="Used">
        {!hasScan ? (
          <span className="wb-muted">no scan</span>
        ) : usage ? (
          <>
            <span className="wb-usage-count">{usage.count}</span>
            <span className="wb-usage-unit">
              {usage.count === 1 ? ' use' : ' uses'}
            </span>
            <div className="wb-token-note">
              {`${plural(usage.components, 'place', 'places')}, ${plural(
                usage.routes,
                'page',
                'pages'
              )}`}
            </div>
          </>
        ) : (
          <span className="wb-muted">not used yet</span>
        )}
      </td>
      {footer && (
        <td role="cell" className="wb-token-footer">
          {footer}
        </td>
      )}
    </tr>
  );
};

export default memo(TokenRow);
