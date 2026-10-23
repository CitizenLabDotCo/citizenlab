import {
  CSSProperties,
  memo,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import type { Mode, TokenName } from '@ds/tokens/tokens';

import type { TokenMeta } from '../lib/data';
import type { TokenUsage } from '../lib/usage';
import { plural } from '../lib/plural';

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
  const { current, draft, setDraft, commit, feedback, setFeedback } =
    useTokenEdit({
      name,
      base: token.values[mode],
      override,
      meta,
      mode,
      onSet,
    });

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
        {differs ? (
          (['today', 'redesign'] as Mode[]).map((m) => (
            <div
              key={m}
              className={
                m === mode ? 'wb-mode-value wb-mode-value-on' : 'wb-mode-value'
              }
            >
              <span className="wb-mode-name">{MODE_LABEL[m]}</span>
              <span className="wb-token-value">{shown(token.values[m])}</span>
              {m === 'redesign' && (
                <span className="wb-diff-dot" title="Differs from Today" />
              )}
            </div>
          ))
        ) : (
          <div
            className="wb-mode-value wb-mode-value-on"
            title="Same in Today and Redesign"
          >
            <span className="wb-token-value">{shown(token.values[mode])}</span>
          </div>
        )}
        {override !== undefined && (
          <div className="wb-token-now">
            <span className="wb-mode-name">Edited</span>
            <span className="wb-token-value">{shown(override)}</span>
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
