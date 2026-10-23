import { useEffect, useState } from 'react';

import type { TokenName } from '@ds/tokens/tokens';

import type { ElementEdit } from '../lib/elementEdits';
import { InspectRow, shortName } from '../lib/inspect';

import Icon from './Icon';

export type FieldProps = {
  row: InspectRow;
  // The token's live value in the mode, for the pill's muted value.
  liveToken?: string;
  // The session's edit of this row, when any (the custom caution mark).
  edit?: ElementEdit;
  onCommit: (typed: string) => void;
  onAttach: (token: TokenName) => void;
  onDetach: () => void;
  onOpenPicker: () => void;
};

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
  onOpenPicker,
}: FieldProps) => {
  const v = row.value;
  const bound = v.link === 'linked' && !!v.token;
  const lead = v.swatch ? (
    <span
      className="wb-vf-swatch"
      style={{ background: v.swatch }}
      aria-hidden="true"
    />
  ) : (
    <Icon name={row.glyph} size={14} />
  );
  const [draft, setDraft] = useState(v.shown);
  useEffect(() => setDraft(v.shown), [v.shown]);
  const name = row.label || row.id;

  if (bound) {
    const token = v.token as TokenName;
    return (
      <div
        className="wb-vf wb-vf-pill"
        data-testid="wb-insp-value"
        data-link="linked"
        data-token={token}
        data-row={row.id}
      >
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
    <div
      className={edit?.kind === 'custom' ? 'wb-vf wb-vf-custom' : 'wb-vf'}
      data-testid="wb-insp-value"
      data-link={v.link === 'equal' ? 'equal' : 'none'}
      data-token={v.token}
      data-row={row.id}
    >
      <span className="wb-vf-body">
        {lead}
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
      {v.link === 'equal' && v.token && row.editable && (
        <button
          type="button"
          className="wb-vf-side"
          data-testid="wb-insp-suggest"
          data-token={v.token}
          aria-label={`Attach ${shortName(v.token)}`}
          onClick={() => onAttach(v.token as TokenName)}
        >
          <Icon name="attach" size={14} />
        </button>
      )}
    </div>
  );
};
