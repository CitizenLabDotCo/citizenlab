import { useEffect, useState } from 'react';

import type { TokenName } from '@ds/tokens/tokens';

import type { ElementEdit } from '../lib/elementEdits';
import { fitsProp, InspectRow, shortName } from '../lib/inspect';
import { lookWords, Suggestion } from '../lib/legacyTokens';
import { nudgeValue, stepOfKey } from '../lib/nudge';
import { shortFile, SourceLine } from '../lib/sourceLine';

import Icon from './Icon';

export type FieldProps = {
  row: InspectRow;
  // The token's live value, for the pill's muted value.
  liveToken?: string;
  // The session's edit of this row, when any (the custom caution mark).
  edit?: ElementEdit;
  // `exact`: an arrow step, applied as it is rather than snapped. False
  // when the value is refused.
  onCommit: (typed: string, exact?: boolean) => boolean | void;
  onAttach: (token: TokenName) => void;
  onDetach: () => void;
  // Moves a typed value to where its named value is defined, and back.
  onDefine?: () => void;
  onOpenPicker: () => void;
  // Read only (Inspect): a pill opens its token's Foundations row in a new
  // tab instead of the picker.
  tokenHref?: string;
  // Where the code writes the value; 'pending' while the trace runs.
  source?: SourceLine | 'pending';
  // Tokens the token data lists for the code the value is read from.
  suggestions?: Suggestion[];
  // Selects the ancestor an inherited value comes from.
  onSelect?: (el: Element) => void;
  labelOf?: (el: Element) => string;
};

// The line under a value: the code that writes it and where, or why it is
// not traced. On the line, not in a tooltip.
const Source = ({
  row,
  source,
  onSelect,
  labelOf,
}: Pick<FieldProps, 'row' | 'source' | 'onSelect' | 'labelOf'>) => {
  if (!source) return null;
  if (source === 'pending') {
    return (
      <div
        className="wb-vf-source"
        data-testid="wb-insp-source"
        data-row={row.id}
        data-status="pending"
      />
    );
  }
  const s = source;
  const link = (p: NonNullable<SourceLine['place']>) => (
    <a href={p.href} target="_blank" rel="noopener">
      {`${shortFile(p.file)}:${p.line}`}
    </a>
  );
  const code = s.status === 'traced' && s.read !== 'prop';
  return (
    <div
      className={
        s.status === 'untraced' ? 'wb-vf-source wb-vf-untraced' : 'wb-vf-source'
      }
      data-testid="wb-insp-source"
      data-row={row.id}
      data-status={s.status}
      data-read={s.read}
      data-file={s.place?.file}
      data-line={s.place?.line}
      data-story-frame={s.storyFrame ? 'true' : undefined}
    >
      {s.status === 'inherited' && s.from ? (
        <button
          type="button"
          className="wb-vf-source-from"
          onClick={() => s.from && onSelect?.(s.from)}
        >
          {`from ${labelOf ? labelOf(s.from) : 'a parent'}`}
        </button>
      ) : code ? (
        <code>{s.text}</code>
      ) : (
        <span>{s.text}</span>
      )}
      {s.place && <> · {link(s.place)}</>}
      {s.def && <span className="wb-muted"> (defined at {link(s.def)})</span>}
      {s.shared && (
        <span className="wb-muted">{` · also used by ${s.shared.join(
          ', '
        )}`}</span>
      )}
      {s.differ && <span className="wb-muted"> · other sides differ</span>}
      {s.byHand && !s.differ && (
        <span className="wb-muted" data-testid="wb-insp-by-hand">
          {` · edit by hand: ${s.byHand}`}
        </span>
      )}
    </div>
  );
};

// What attaching each listed token does, one per line: "radius-control ·
// same look".
const Suggestions = ({
  row,
  suggestions,
  onAttach,
}: Pick<FieldProps, 'row' | 'suggestions' | 'onAttach'>) =>
  suggestions && suggestions.length > 0 ? (
    <ul
      className="wb-vf-suggest"
      data-row={row.id}
      aria-label={`Tokens for ${row.label}`}
    >
      {suggestions.map((s) => (
        <li key={s.token}>
          <button
            type="button"
            data-testid="wb-insp-suggest"
            data-token={s.token}
            data-same-look={s.sameLook}
            aria-label={`Attach ${shortName(s.token)}, ${lookWords(s)}`}
            onClick={() => onAttach(s.token)}
          >
            <Icon name="attach" size={12} />
            <code>{shortName(s.token)}</code>
            <span className={s.sameLook ? 'wb-muted' : 'wb-vf-changes'}>
              {lookWords(s)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  ) : null;

// One value of the selection, as Figma draws it: a pill when the value is
// bound to a token, a field otherwise. The glyph says which property; the
// words live in aria-labels only.
export const ValueField = ({
  row,
  liveToken,
  edit,
  onCommit,
  onAttach,
  onDetach,
  onDefine,
  onOpenPicker,
  tokenHref,
  source,
  suggestions,
  onSelect,
  labelOf,
}: FieldProps) => {
  const v = row.value;
  // Bound: the winning declaration reads the token, or the session's edit
  // attached it.
  const bound = !!v.token;
  const below = (
    <>
      <Source row={row} source={source} onSelect={onSelect} labelOf={labelOf} />
      {!bound && row.editable && (
        <Suggestions row={row} suggestions={suggestions} onAttach={onAttach} />
      )}
      {onDefine &&
        edit?.define &&
        (edit.kind === 'custom' || edit.kind === 'define') && (
          <button
            type="button"
            className="wb-vf-define"
            data-testid="wb-insp-define"
            data-on={edit.kind === 'define' ? 'true' : undefined}
            aria-pressed={edit.kind === 'define'}
            onClick={onDefine}
          >
            {edit.kind === 'define'
              ? `Changing ${edit.define.name} at ${shortFile(
                  edit.define.file
                )}:${edit.define.line}, every use follows · only here instead`
              : `Change ${edit.define.name} where it's defined (${shortFile(
                  edit.define.file
                )}:${edit.define.line}), every use follows`}
          </button>
        )}
    </>
  );
  const swatch = v.swatch && (
    <span
      className="wb-vf-swatch"
      style={{ background: v.swatch }}
      aria-hidden="true"
    />
  );
  // A box's Fill holds its background and the colour of its text: the
  // text one carries the text glyph too.
  const lead = !swatch ? (
    <Icon name={row.glyph} size={14} />
  ) : row.id === 'color' && row.label === 'Text' ? (
    <>
      <Icon name="text" size={14} />
      {swatch}
    </>
  ) : (
    swatch
  );
  const name = row.label || row.id;
  // A text value's glyph opens the picker, as a pill's body does, when
  // some token can stand for the property.
  const pickable =
    (row.editable || !!row.pickOnly) && !!fitsProp(row.props[0] ?? '');
  const [draft, setDraft] = useState(v.shown);
  useEffect(() => setDraft(v.shown), [v.shown]);

  if (bound) {
    const token = v.token as TokenName;
    return (
      <>
        <div
          className="wb-vf wb-vf-pill"
          data-testid="wb-insp-value"
          data-token={token}
          data-raw={v.raw}
          data-row={row.id}
        >
          {tokenHref ? (
            <a
              className="wb-vf-body"
              href={tokenHref}
              target="_blank"
              rel="noopener"
              data-testid="wb-insp-token-link"
              aria-label={`${name}: ${shortName(token)}. Open in Foundations`}
              title={`Open ${shortName(token)} in Foundations`}
            >
              {lead}
              <span className="wb-vf-name">{shortName(token)}</span>
              <span className="wb-vf-muted">{v.shown}</span>
              <span className="wb-vf-open" aria-hidden="true">
                <Icon name="external" size={12} />
              </span>
            </a>
          ) : (
            <button
              type="button"
              className="wb-vf-body"
              aria-label={`${name}: ${shortName(token)}`}
              aria-haspopup="dialog"
              onClick={onOpenPicker}
            >
              {lead}
              <span className="wb-vf-name">{shortName(token)}</span>
              {liveToken && <span className="wb-vf-muted">{v.shown}</span>}
            </button>
          )}
          {row.editable && (
            <button
              type="button"
              className="wb-vf-side wb-vf-detach"
              data-testid="wb-insp-detach"
              aria-label="Detach"
              onClick={onDetach}
            >
              <Icon name="detach" size={14} />
            </button>
          )}
        </div>
        {below}
      </>
    );
  }

  // A short list of values (direction, alignment): a menu, each choice
  // applied as it is.
  if (row.choices && row.editable) {
    const known = row.choices.some(([c]) => c === v.raw);
    return (
      <>
        <div
          className="wb-vf wb-vf-menu"
          data-testid="wb-insp-value"
          data-raw={v.raw}
          data-row={row.id}
        >
          <span className="wb-vf-body">
            {lead}
            <select
              data-testid="wb-insp-choice"
              aria-label={name}
              value={v.raw}
              onChange={(e) => onCommit(e.target.value, true)}
            >
              {!known && <option value={v.raw}>{v.shown}</option>}
              {row.choices.map(([value, words]) => (
                <option key={value} value={value}>
                  {words}
                </option>
              ))}
            </select>
          </span>
        </div>
        {below}
      </>
    );
  }

  const commit = (text: string) => {
    const t = text.trim();
    if (!t || t === v.shown) {
      setDraft(v.shown);
      return;
    }
    onCommit(t);
  };

  return (
    <>
      <div
        className={
          edit?.kind === 'custom' || edit?.kind === 'define'
            ? 'wb-vf wb-vf-custom'
            : 'wb-vf'
        }
        data-testid="wb-insp-value"
        data-raw={v.raw}
        data-row={row.id}
      >
        <span className="wb-vf-body">
          {pickable ? (
            <button
              type="button"
              className="wb-vf-lead"
              data-testid="wb-insp-pick"
              aria-label={`Choose a token for ${name}`}
              aria-haspopup="dialog"
              onClick={onOpenPicker}
            >
              {lead}
            </button>
          ) : (
            lead
          )}
          {row.editable ? (
            <input
              data-testid="wb-insp-input"
              aria-label={name}
              value={draft}
              spellCheck={false}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={(e) => commit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit(e.currentTarget.value);
                if (e.key === 'Escape') {
                  // The panel's own Esc (select the parent) waits.
                  e.stopPropagation();
                  setDraft(v.shown);
                }
                // Arrows step the number by 1, Shift by 10, as Foundations'
                // fields do: a weight by 100 within 100 to 900, a line height
                // by 0.01; only letter spacing goes below 0. A colour (hex
                // shown without its #) never steps. The field shows the step
                // only once the edit took it.
                const step = row.snap === 'color' ? 0 : stepOfKey(e);
                const next =
                  step &&
                  nudgeValue(e.currentTarget.value, step, {
                    caret: e.currentTarget.selectionStart ?? undefined,
                    ...(row.id === 'weight'
                      ? { by: 100, min: 100, max: 900 }
                      : row.id === 'opacity'
                      ? { min: 0, max: 100 }
                      : {
                          min: row.id === 'ls' ? undefined : 0,
                          fine: row.id === 'lh',
                        }),
                  });
                if (next) {
                  e.preventDefault();
                  if (onCommit(next.value, true) !== false)
                    setDraft(next.value);
                }
              }}
            />
          ) : (
            <span className="wb-vf-text" aria-label={name}>
              {v.shown}
            </span>
          )}
        </span>
        {edit?.kind === 'custom' && (
          <span
            className="wb-vf-side wb-vf-caution"
            role="img"
            aria-label="Custom value, off the scale"
          >
            <Icon name="caution" size={14} />
          </span>
        )}
      </div>
      {below}
    </>
  );
};
