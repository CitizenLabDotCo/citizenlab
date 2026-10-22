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

type Props = {
  token: TokenMeta;
  meta: TokenMeta[];
  mode: Mode;
  // The session's override of this token, if any.
  override?: string;
  // The token's value in `mode` with every override applied, var() chains
  // followed: what the preview shows.
  live: string;
  usage?: TokenUsage;
  // False when the scan is not loaded, so usage reads "no scan".
  hasScan: boolean;
  scaleId?: string;
  onSet: (name: TokenName, value: string) => string | undefined;
  onReset: (name: TokenName) => void;
};

const SAMPLE = 'Aa';

// A small picture of the token, drawn with its live value.
const Preview = ({ token, live }: { token: TokenMeta; live: string }) => {
  const kind = token.type ?? '';
  const name = token.name;
  let style: CSSProperties = {};
  let text: string | undefined;
  if (token.category === 'color' || kind === 'color') {
    style = { background: live };
  } else if (token.category === 'space') {
    return (
      <span className="wb-token-preview wb-token-preview-bar">
        <span style={{ width: live }} />
      </span>
    );
  } else if (token.category === 'radius') {
    style = { borderRadius: live };
  } else if (kind === 'shadow') {
    style = { boxShadow: live };
  } else if (kind === 'border') {
    style = { outline: live, outlineOffset: '2px' };
  } else if (kind === 'fontFamily') {
    style = { fontFamily: live };
    text = SAMPLE;
  } else if (kind === 'number' && /weight/.test(name)) {
    style = { fontWeight: live as CSSProperties['fontWeight'] };
    text = SAMPLE;
  } else if (/-ls$/.test(name)) {
    style = { letterSpacing: live };
    text = 'Ag Ag';
  } else if (/-lh$/.test(name)) {
    style = { lineHeight: live };
    text = 'line';
  } else if (token.category === 'font' || token.category === 'text') {
    style = { fontSize: live };
    text = SAMPLE;
  } else {
    return <span className="wb-token-preview wb-token-preview-none" />;
  }
  return (
    <span
      className={`wb-token-preview${text ? ' wb-token-preview-text' : ''}`}
      style={style}
      aria-hidden="true"
    >
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
  const other: Mode = mode === 'today' ? 'redesign' : 'today';
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

  const hex = token.category === 'color' ? toHex6(live) : undefined;
  const inputId = `wb-edit-${name.slice(2)}`;

  return (
    <tr
      className={override !== undefined ? 'wb-token-edited' : undefined}
      data-testid="wb-token-row"
      data-token={name}
    >
      <td>
        <Preview token={token} live={live} />
      </td>
      <th scope="row">
        <code>{name}</code>
        {token.deprecated && <span className="wb-tag">deprecated</span>}
        {token.tier === 1 && <span className="wb-tag">scale</span>}
        {token.description && (
          <div className="wb-token-note">{token.description}</div>
        )}
        {token.legacy.length > 0 && (
          <div className="wb-token-note">Legacy: {token.legacy.join(', ')}</div>
        )}
      </th>
      <td>
        <span className="wb-token-value">{base}</span>
        {override !== undefined && (
          <div className="wb-token-now">now {override}</div>
        )}
      </td>
      <td className="wb-muted">
        <span className="wb-token-value" title={MODE_LABEL[other]}>
          {token.values[other]}
        </span>
      </td>
      <td>
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
      <td className="wb-token-usage">
        {!hasScan ? (
          <span className="wb-muted">no scan</span>
        ) : usage ? (
          <>
            <strong>{usage.count}</strong> uses
            <div className="wb-muted">
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
