import { useEffect, useMemo, useState } from 'react';

import tokensSource from '@ds/tokens/tokens.source.json';
import type { Mode, TokenName } from '@ds/tokens/tokens';

import type { TokenMeta } from '../lib/data';
import { Overrides, withOverrides } from '../lib/overrides';
import { sourceChanges, sourcePatch } from '../lib/sourceDiff';

type Props = {
  meta: TokenMeta[];
  mode: Mode;
  overrides: Overrides;
  onReset: (name?: TokenName) => void;
  onClose: () => void;
};

type Copied = { label: string; text: string; ok: boolean };

const copyText = async (text: string): Promise<boolean> => {
  try {
    if (!navigator.clipboard) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

const MODES_TEXT = {
  both: 'both modes',
  today: 'Today',
  redesign: 'Redesign',
};

// Every edit of the session, with ways to hand it on: the exact change to
// tokens.source.json for a developer, or a link that opens the workbench
// with the same edits.
const ChangesDrawer = ({ meta, mode, overrides, onReset, onClose }: Props) => {
  const [copied, setCopied] = useState<Copied | undefined>();
  const byName = useMemo(() => new Map(meta.map((t) => [t.name, t])), [meta]);
  const entries = Object.entries(overrides).filter(
    (e): e is [string, string] => typeof e[1] === 'string'
  );
  const diff = useMemo(
    () => sourceChanges(overrides, meta, tokensSource),
    [overrides, meta]
  );
  const patch = useMemo(() => sourcePatch(diff.changes), [diff]);
  // A copied text goes stale as soon as the edits change.
  useEffect(() => setCopied(undefined), [patch]);

  const copy = async (label: string, text: string) => {
    setCopied({ label, text, ok: await copyText(text) });
  };
  const shareLink = () => {
    const { origin, pathname, search, hash } = window.location;
    return `${origin}${pathname}${search}${withOverrides(hash, overrides)}`;
  };

  return (
    <section
      className="wb-drawer"
      aria-label="Changes"
      data-testid="wb-changes"
    >
      <header className="wb-drawer-head">
        <h2>Changes ({entries.length})</h2>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </header>
      {entries.length === 0 ? (
        <p className="wb-muted">
          No edits yet. Change a value on any Foundations page and it shows up
          here.
        </p>
      ) : (
        <>
          <ul className="wb-change-list">
            {entries.map(([name, to]) => (
              <li key={name} data-testid="wb-change-row" data-token={name}>
                <code>{name}</code>
                <div>
                  <span className="wb-muted">
                    {byName.get(name)?.values[mode] ?? 'unknown'}
                  </span>{' '}
                  to <strong>{to}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => onReset(name as TokenName)}
                >
                  Reset
                </button>
              </li>
            ))}
          </ul>
          <div className="wb-drawer-actions">
            <button
              type="button"
              data-testid="wb-copy-diff"
              onClick={() => copy('token source diff', patch)}
            >
              Copy as token source diff
            </button>
            <button
              type="button"
              data-testid="wb-copy-link"
              onClick={() => copy('share link', shareLink())}
            >
              Copy share link
            </button>
            <button type="button" onClick={() => onReset()}>
              Reset all
            </button>
          </div>
          {copied &&
            (copied.ok ? (
              <p className="wb-muted" role="status">
                Copied the {copied.label}.
              </p>
            ) : (
              <div className="wb-copy-fallback" role="status">
                <p>
                  This browser did not allow copying. Select the text below and
                  copy it yourself.
                </p>
                <textarea
                  readOnly
                  data-testid="wb-copy-fallback"
                  value={copied.text}
                  rows={8}
                  onFocus={(e) => e.currentTarget.select()}
                  autoFocus
                />
              </div>
            ))}
          <details className="wb-drawer-diff">
            <summary>What the token source diff changes</summary>
            <ul>
              {diff.changes.map((c) => (
                <li key={c.pointer}>
                  <code>{c.pointer}</code> ({MODES_TEXT[c.modes]}):{' '}
                  {JSON.stringify(c.from)} to {JSON.stringify(c.to)}
                </li>
              ))}
              {diff.unknown.map((n) => (
                <li key={n}>
                  <code>{n}</code> is not in tokens.source.json.
                </li>
              ))}
            </ul>
            <p className="wb-muted">
              For app/design-system/tokens/tokens.source.json, as a JSON Patch.
              An edit holds in both modes, so a token with its own Redesign
              value changes in both places. Then run npm run ds:tokens.
            </p>
            <pre>{patch}</pre>
          </details>
        </>
      )}
    </section>
  );
};

export default ChangesDrawer;
