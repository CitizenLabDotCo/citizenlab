import { useEffect, useRef, useState } from 'react';

import type { TokenName } from '@ds/tokens/tokens';

import type { TokenMeta } from '../lib/data';
import { fitsProp, InspectRow, shortName } from '../lib/inspect';
import { pickerGroups } from '../lib/tokenPicker';

import Icon from './Icon';
import { Preview } from './TokenRow';

type Props = {
  row: InspectRow;
  meta: TokenMeta[];
  // Every token's live value in the mode (var() chains followed).
  resolved: Record<string, string>;
  onPick: (token: TokenName) => void;
  onClose: () => void;
};

// Figma's variable popover: search, the tokens that fit the property, the
// ones that equal the rendered value first. Enter picks the first row, Esc
// or a click outside closes.
const TokenPicker = ({ row, meta, resolved, onPick, onClose }: Props) => {
  const [query, setQuery] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);
  useEffect(() => {
    const away = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) onClose();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', key, true);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', key, true);
    };
  }, [onClose]);
  const fits = fitsProp(row.props[0]) ?? (() => false);
  const groups = pickerGroups(meta, fits, resolved, row.value.raw, query);
  const first = groups[0]?.tokens[0];
  const target = row.value.token ?? first?.name;
  const category = meta.find((t) => t.name === target)?.category;
  return (
    <div
      className="wb-picker"
      data-testid="wb-token-picker"
      ref={root}
      role="dialog"
      aria-label={`Token for ${row.label || row.id}`}
    >
      <label className="wb-search wb-picker-search">
        <Icon name="search" size={14} />
        <input
          ref={input}
          type="search"
          aria-label="Search tokens"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && first) onPick(first.name as TokenName);
          }}
        />
      </label>
      <div className="wb-picker-list">
        {groups.map((g) => (
          <section key={g.id} className="wb-picker-group">
            <h4>{g.label}</h4>
            {g.tokens.map((t) => (
              <button
                key={t.name}
                type="button"
                className="wb-picker-row"
                data-testid="wb-token-picker-row"
                data-token={t.name}
                aria-pressed={t.name === row.value.token}
                onClick={() => onPick(t.name as TokenName)}
              >
                <span className="wb-picker-preview" aria-hidden="true">
                  <Preview
                    token={t}
                    value={resolved[t.name] ?? t.values.today}
                    all={resolved}
                  />
                </span>
                <span className="wb-picker-name">{shortName(t.name)}</span>
                <span className="wb-vf-muted">
                  {resolved[t.name] ?? t.values.today}
                </span>
              </button>
            ))}
          </section>
        ))}
      </div>
      {target && category && (
        <a
          className="wb-picker-edit"
          data-testid="wb-token-picker-edit"
          href={`#/foundations/${category}/${encodeURIComponent(target)}`}
        >
          <Icon name="external" size={14} />
          Edit in Foundations
        </a>
      )}
    </div>
  );
};

export default TokenPicker;
