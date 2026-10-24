import { useEffect, useMemo, useState } from 'react';

import type { TokenName } from '@ds/tokens/tokens';

import { copyText } from '../lib/clipboard';
import type { TokenMeta } from '../lib/data';
import { tokenSource } from '../lib/liveSource';
import {
  changesLook,
  ElementEdit,
  TaskContext,
  taskOfEdit,
} from '../lib/elementEdits';
import { shortName } from '../lib/inspect';
import { Overrides, withOverrides } from '../lib/overrides';
import { sourceChanges, sourcePatch } from '../lib/sourceDiff';

import Icon, { IconName } from './Icon';
import LocalSave from './LocalSave';
import { useLocal } from '../lib/local';

type Props = {
  meta: TokenMeta[];
  overrides: Overrides;
  onReset: (name?: TokenName) => void;
  onClose: () => void;
  // The canvas's element edits (attach, swap, detach, custom, file).
  elements?: ElementEdit[];
  onResetElement?: (id: string) => void;
  onResetElements?: () => void;
  // When set, "Copy for agent" is offered.
  task?: TaskContext;
  // A token's live value, for the look mark and the swatch.
  resolve?: (token: TokenName) => string;
  // In the page flow (under the canvas bar) instead of a side sheet.
  inline?: boolean;
};

const NO_ELEMENTS: ElementEdit[] = [];

const markOf = (e: ElementEdit, look: boolean): [IconName, string] => {
  if (look) return ['caution', 'Changes the look'];
  if (e.kind === 'swap') return ['swap', 'Swaps the token'];
  return ['attach', 'Attaches the token'];
};

const COLOUR_ROW = /colou?r|fill/;

// One element edit: glyph or swatch, layer row label, from -> to, kind.
const ElementRow = ({
  edit: e,
  resolve,
  onReset,
}: {
  edit: ElementEdit;
  resolve?: (token: TokenName) => string;
  onReset?: (id: string) => void;
}) => {
  const look = resolve ? changesLook(e, resolve) : e.kind !== 'attach';
  const [mark, words] = markOf(e, look);
  const after = e.to.token ? resolve?.(e.to.token) || e.to.value : e.to.value;
  return (
    <li
      className="wb-change-el"
      data-testid="wb-change-row"
      data-edit={e.id}
      data-kind={e.kind}
    >
      <span className="wb-change-glyph" aria-hidden="true">
        {COLOUR_ROW.test(e.rowId) ? (
          <span className="wb-vf-swatch" style={{ background: after }} />
        ) : (
          <Icon name={e.glyph} size={14} />
        )}
      </span>
      <div>
        <div className="wb-change-where">{e.label}</div>
        <span className="wb-muted">
          {e.from.token ? shortName(e.from.token) : e.from.shown}
        </span>
        {' → '}
        <strong>{e.to.token ? shortName(e.to.token) : e.to.value}</strong>
      </div>
      <span
        className={look ? 'wb-change-mark wb-change-look' : 'wb-change-mark'}
        role="img"
        aria-label={words}
      >
        <Icon name={mark} size={14} />
      </span>
      <button type="button" onClick={() => onReset?.(e.id)}>
        Reset
      </button>
    </li>
  );
};

type Copied = { label: string; text: string; ok: boolean };

// Every edit of the session, with ways to hand it on: the exact change to
// tokens.source.json for a developer, or a link that opens the workbench
// with the same edits.
const ChangesDrawer = ({
  meta,
  overrides,
  onReset,
  onClose,
  elements = NO_ELEMENTS,
  onResetElement,
  onResetElements,
  task,
  resolve,
  inline,
}: Props) => {
  const [copied, setCopied] = useState<Copied | undefined>();
  const byName = useMemo(() => new Map(meta.map((t) => [t.name, t])), [meta]);
  const entries = Object.entries(overrides).filter(
    (e): e is [string, string] => typeof e[1] === 'string'
  );
  const diff = useMemo(
    () => sourceChanges(overrides, meta, tokenSource()),
    [overrides, meta]
  );
  const patch = useMemo(() => sourcePatch(diff.changes), [diff]);
  // A copied text goes stale as soon as the edits change.
  useEffect(() => setCopied(undefined), [patch, elements]);
  const total = entries.length + elements.length;
  const local = useLocal();
  const agentTasks = task ? elements.map((e) => taskOfEdit(e, task)) : [];

  const copy = async (label: string, text: string) => {
    setCopied({ label, text, ok: await copyText(text) });
  };
  const shareLink = () => {
    const { origin, pathname, search, hash } = window.location;
    return `${origin}${pathname}${search}${withOverrides(hash, overrides)}`;
  };

  return (
    <section
      className={inline ? 'wb-drawer wb-drawer-inline' : 'wb-drawer'}
      aria-label="Changes"
      data-testid="wb-changes"
    >
      <header className="wb-drawer-head">
        <h2>Changes ({total})</h2>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </header>
      <LocalSave
        changes={diff.changes}
        patch={patch}
        elements={elements}
        onSavedTokens={() => onReset()}
        onSavedElement={onResetElement}
      />
      {total === 0 ? (
        local ? null : (
          <p className="wb-muted">
            No edits yet. Change a token value here or on a Foundations page and
            it shows up in this list.
          </p>
        )
      ) : (
        <>
          {elements.length > 0 && (
            <>
              <h3 className="wb-drawer-group">Elements</h3>
              <ul className="wb-change-list">
                {elements.map((e) => (
                  <ElementRow
                    key={e.id}
                    edit={e}
                    resolve={resolve}
                    onReset={onResetElement}
                  />
                ))}
              </ul>
            </>
          )}
          {entries.length > 0 && elements.length > 0 && (
            <h3 className="wb-drawer-group">Tokens</h3>
          )}
          <ul className="wb-change-list">
            {entries.map(([name, to]) => (
              <li key={name} data-testid="wb-change-row" data-token={name}>
                <code>{name}</code>
                <div>
                  <span className="wb-muted">
                    {byName.get(name)?.value ?? 'unknown'}
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
            {agentTasks.length > 0 && (
              <button
                type="button"
                data-testid="wb-copy-agent"
                onClick={() =>
                  copy('tasks for the agent', agentTasks.join('\n\n'))
                }
              >
                <Icon name="copy" size={14} />
                Copy for agent
              </button>
            )}
            {entries.length > 0 && (
              <button
                type="button"
                data-testid="wb-copy-diff"
                onClick={() => copy('token source diff', patch)}
              >
                Copy as token source diff
              </button>
            )}
            {entries.length > 0 && (
              <button
                type="button"
                data-testid="wb-copy-link"
                onClick={() => copy('share link', shareLink())}
              >
                Copy share link
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onReset();
                onResetElements?.();
              }}
            >
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
          {entries.length > 0 && (
            <details className="wb-drawer-diff">
              <summary>What the token source diff changes</summary>
              <ul>
                {diff.changes.map((c) => (
                  <li key={c.pointer}>
                    <code>{c.pointer}</code>: {JSON.stringify(c.from)} to{' '}
                    {JSON.stringify(c.to)}
                  </li>
                ))}
                {diff.unknown.map((n) => (
                  <li key={n}>
                    <code>{n}</code> is not in tokens.source.json.
                  </li>
                ))}
              </ul>
              <p className="wb-muted">
                For app/design-system/tokens/tokens.source.json, as a JSON
                Patch. Then run npm run ds:tokens.
              </p>
              <pre>{patch}</pre>
            </details>
          )}
        </>
      )}
    </section>
  );
};

export default ChangesDrawer;
