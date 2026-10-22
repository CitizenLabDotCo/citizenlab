import { CSSProperties, memo, useEffect, useRef, useState } from 'react';

import type { Mode, TokenName } from '@ds/tokens/tokens';

import type { TokenMeta } from '../lib/data';
import { parseColour, snap } from '../lib/overrides';
import type { TokenUsage } from '../lib/usage';

// React fires onChange on every tick of a drag. Only the native `change`
// event (picker closed) commits; ticks just preview in the text field.
const ColourPicker = ({
  label,
  value,
  onPreview,
  onCommit,
}: {
  label: string;
  value: string;
  onPreview: (v: string) => void;
  onCommit: (v: string) => void;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const done = () => commitRef.current(el.value);
    el.addEventListener('change', done);
    return () => el.removeEventListener('change', done);
  }, []);
  const [picked, setPicked] = useState(value);
  useEffect(() => setPicked(value), [value]);
  return (
    <input
      ref={ref}
      type="color"
      aria-label={label}
      value={picked}
      onChange={(e) => {
        setPicked(e.target.value);
        onPreview(e.target.value);
      }}
    />
  );
};

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
};

// Widest a space bar is drawn; longer values are cut with a fade.
const BAR_MAX = 200;

const px = (value: string) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

// The text role a type token belongs to (--gv-type-h1-lh: h1).
const roleOf = (name: string) => /^--gv-type-([a-z0-9]+)-/.exec(name)?.[1];

// A picture of the token, drawn with one mode's live value. `all` holds the
// other tokens of that mode, for previews that need a neighbour (the size
// of a text role, the colour of the focus ring).
const Preview = ({
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
  if (token.category === 'motion') {
    return (
      <span
        className="wb-pv wb-pv-motion"
        style={{ '--wb-duration': value } as CSSProperties}
      >
        <span />
      </span>
    );
  }
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

const toHex6 = (value: string): string | undefined => {
  const rgba = parseColour(value);
  if (!rgba) return undefined;
  return (
    '#' +
    rgba
      .slice(0, 3)
      .map((c) => Math.round(c).toString(16).padStart(2, '0'))
      .join('')
  );
};

type Feedback = { kind: 'info' | 'flag' | 'error'; text: string };

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
}: Props) => {
  const name = token.name as TokenName;
  const base = token.values[mode];
  const current = override ?? base;
  const [draft, setDraft] = useState(current);
  const [feedback, setFeedback] = useState<Feedback | undefined>();
  useEffect(() => setDraft(current), [current]);

  const commit = (typed: string) => {
    const value = typed.trim();
    if (!value || value === current) {
      setDraft(current);
      return;
    }
    const result = snap(name, value, meta, mode);
    if (result.value === current) {
      setDraft(current);
      setFeedback({
        kind: 'info',
        text: `Moved to ${result.value}, no change.`,
      });
      return;
    }
    const error = onSet(name, result.value);
    if (error) {
      setFeedback({ kind: 'error', text: `Not applied: ${error}.` });
      setDraft(current);
      return;
    }
    if (result.custom) {
      setFeedback({
        kind: 'flag',
        text: 'Custom value: not on the scale or palette.',
      });
    } else if (result.snapped && result.value !== value) {
      setFeedback({
        kind: 'info',
        text: `Moved to ${result.value}${result.to ? ` (${result.to})` : ''}.`,
      });
    } else {
      setFeedback(undefined);
    }
  };

  const value = live[mode][name] || token.values[mode];
  const differs =
    (live.today[name] || token.values.today) !==
    (live.redesign[name] || token.values.redesign);
  const hex = token.category === 'color' ? toHex6(value) : undefined;
  const inputId = `wb-edit-${name.slice(2)}`;

  return (
    <tr
      role="row"
      className={override !== undefined ? 'wb-token-edited' : undefined}
      data-testid="wb-token-row"
      data-token={name}
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
          {token.tier === 1 && <span className="wb-tag">scale</span>}
          {token.deprecated && (
            <span className="wb-tag wb-tag-warn">deprecated</span>
          )}
        </span>
        {token.description && (
          <div className="wb-token-note">{token.description}</div>
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
        {differs ? (
          (['today', 'redesign'] as Mode[]).map((m) => (
            <div
              key={m}
              className={
                m === mode ? 'wb-mode-value wb-mode-value-on' : 'wb-mode-value'
              }
            >
              <span className="wb-mode-name">{MODE_LABEL[m]}</span>
              <span className="wb-token-value">{token.values[m]}</span>
              {m === 'redesign' && (
                <span className="wb-diff-dot" title="Differs from Today" />
              )}
            </div>
          ))
        ) : (
          <div className="wb-mode-value wb-mode-value-on">
            <span className="wb-mode-name">Both</span>
            <span className="wb-token-value">{token.values[mode]}</span>
          </div>
        )}
        {override !== undefined && (
          <div className="wb-token-now">
            <span className="wb-mode-name">Edited</span>
            <span className="wb-token-value">{override}</span>
          </div>
        )}
      </td>
      <td role="cell" data-label="Edit">
        <div className="wb-token-edit">
          <label className="wb-visually-hidden" htmlFor={inputId}>
            {`New value for ${name}`}
          </label>
          <input
            id={inputId}
            data-testid="wb-token-input"
            value={draft}
            list={scaleId}
            spellCheck={false}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit(e.currentTarget.value);
              if (e.key === 'Escape') setDraft(current);
            }}
          />
          {hex && (
            <ColourPicker
              label={`Pick a colour for ${name}`}
              value={hex}
              onPreview={setDraft}
              onCommit={commit}
            />
          )}
          {override !== undefined && (
            <button
              type="button"
              onClick={() => {
                onReset(name);
                setFeedback(undefined);
              }}
            >
              Reset
            </button>
          )}
        </div>
        {feedback && (
          <div
            className={`wb-token-feedback wb-token-feedback-${feedback.kind}`}
            role={feedback.kind === 'error' ? 'alert' : 'status'}
          >
            {feedback.text}
          </div>
        )}
      </td>
      <td role="cell" className="wb-token-usage" data-label="Used">
        {!hasScan ? (
          <span className="wb-muted">no scan</span>
        ) : usage ? (
          <>
            <span className="wb-usage-count">{usage.count}</span>
            <span className="wb-usage-unit"> uses</span>
            <div className="wb-token-note">
              {usage.components} places, {usage.routes} pages
            </div>
          </>
        ) : (
          <span className="wb-muted">not used yet</span>
        )}
      </td>
    </tr>
  );
};

export default memo(TokenRow);
