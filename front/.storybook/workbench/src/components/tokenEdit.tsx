import { useEffect, useRef, useState } from 'react';

import type { Mode, TokenName } from '@ds/tokens/tokens';

import type { TokenMeta } from '../lib/data';
import { parseColour, snap } from '../lib/overrides';

// React fires onChange on every tick of a drag. Only the native `change`
// event (picker closed) commits; ticks just preview in the text field.
export const ColourPicker = ({
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

export const toHex6 = (value: string): string | undefined => {
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

export type Feedback = { kind: 'info' | 'flag' | 'error'; text: string };

type EditArgs = {
  name: TokenName;
  // The token's value in the mode, before the session's edits.
  base: string;
  override?: string;
  meta: TokenMeta[];
  mode: Mode;
  onSet: (name: TokenName, value: string) => string | undefined;
};

// A token's edit field: the draft, and the commit that snaps it to the
// scale or palette, sets it for the session and says what happened.
export const useTokenEdit = ({
  name,
  base,
  override,
  meta,
  mode,
  onSet,
}: EditArgs) => {
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
  return { current, draft, setDraft, commit, feedback, setFeedback };
};
