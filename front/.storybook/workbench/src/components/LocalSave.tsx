import { useState } from 'react';

import type { TokenName } from '@ds/tokens/tokens';

import type { ElementEdit } from '../lib/elementEdits';
import { shortName } from '../lib/inspect';
import { useLocal } from '../lib/local';
import { dropSessionOverrides } from '../lib/overrides';
import type { SourceChange } from '../lib/sourceDiff';

import Icon from './Icon';

// "tokens.source.json and 2 more": what a saved edit wrote, short.
const fileNames = (files: string[]) => {
  const names = files.map((f) => f.split('/').pop());
  return names.length > 2
    ? `${names[0]} and ${names.length - 1} more`
    : names.join(', ');
};

// "Accordion" for app/.../Accordion/index.tsx, else the file's name.
const fileTitle = (file: string) => {
  const parts = file.split('/');
  const last = parts[parts.length - 1].replace(/\.tsx?$/, '');
  return last === 'index' ? parts[parts.length - 2] : last;
};

export const savable = (e: ElementEdit) =>
  !!e.file && !!e.line && !!e.col && (!!e.to.token || !!e.to.value);

const elementLabel = (e: ElementEdit) =>
  `${fileTitle(e.file ?? '')} ${e.label}: ${e.from.shown} to ${
    e.to.token ? shortName(e.to.token) : e.to.value
  }`;

const tokensLabel = (changes: SourceChange[]) =>
  changes.length === 1
    ? `${shortName(changes[0].token as TokenName)} ${JSON.stringify(
        changes[0].from
      )} to ${changes[0].to}`.replace(/"/g, '')
    : `${changes.length} token values`;

const BRANCH = /^design-system\/[a-z0-9][a-z0-9-]{1,60}$/;

// In a local run: the session's edits saved to the source (the token
// source, a component's file), the saved edits with Undo, and Push through
// this machine's git.
const LocalSave = ({
  changes,
  patch,
  elements,
  onSavedTokens,
  onSavedElement,
}: {
  changes: SourceChange[];
  patch: string;
  elements: ElementEdit[];
  // Drop the session's token edits; the page reloads on the new source.
  onSavedTokens: () => void;
  onSavedElement?: (id: string) => void;
}) => {
  const local = useLocal();
  const [branch, setBranch] = useState('design-system/');
  const [pushed, setPushed] = useState<string>();
  if (!local) return null;
  const { status, busy, error } = local;
  const toSave = elements.filter(savable);
  const unsaved = changes.length + toSave.length;

  const save = async () => {
    setPushed(undefined);
    for (const e of toSave) {
      const ok = await local.saveStyle(
        { file: e.file!, line: e.line!, col: e.col! },
        e.to.token ? { token: e.to.token } : { value: e.to.value },
        elementLabel(e)
      );
      if (!ok) return;
      onSavedElement?.(e.id);
    }
    if (changes.length) {
      if (!(await local.saveTokens(JSON.parse(patch), tokensLabel(changes)))) {
        return;
      }
      onSavedTokens();
      dropSessionOverrides();
      // The page's token data is built in; read the new source.
      window.location.reload();
    }
  };

  const undo = async (id: string, kind: string) => {
    if ((await local.undo(id)) && kind === 'token') window.location.reload();
  };

  const needsBranch =
    status.protected && status.edits.some((e) => e.kind === 'token');
  const push = async () => {
    const out = await local.push(needsBranch ? branch : undefined);
    if (out) {
      const lines = out.pushed.map((p) =>
        p.kind === 'heal'
          ? `Pushed the heal to its own branch, ${p.branch}, off master.`
          : `Pushed ${p.sha.slice(0, 7)} to ${p.branch}.`
      );
      if (lines.length) {
        lines.push(
          'Open or update the pull request; the review gallery shows what it reaches.'
        );
      }
      if (out.held) lines.push(out.held);
      setPushed(lines.join(' '));
    }
  };

  return (
    <section className="wb-local" data-testid="wb-local" aria-label="Saved">
      {unsaved > 0 && (
        <div className="wb-local-row">
          <p>
            {unsaved === 1 ? 'One edit' : `${unsaved} edits`} only in this
            browser. Save writes them to the code; the screens repaint.
          </p>
          <button
            type="button"
            className="wb-button wb-button-primary"
            data-testid="wb-local-save"
            disabled={busy}
            onClick={save}
          >
            <Icon name="check" size={14} />
            Save to code
          </button>
        </div>
      )}
      <h3 className="wb-drawer-group">
        Saved, not pushed ({status.edits.length})
      </h3>
      {status.edits.length === 0 ? (
        <p className="wb-muted">
          Nothing saved yet. On branch <code>{status.branch}</code>.
        </p>
      ) : (
        <>
          <ul className="wb-change-list">
            {status.edits.map((e) => (
              <li
                key={e.id}
                className="wb-local-item"
                data-testid="wb-saved-row"
                data-kind={e.kind}
              >
                <span className="wb-change-glyph" aria-hidden="true">
                  <Icon
                    name={
                      e.kind === 'token'
                        ? 'tokens'
                        : e.kind === 'agent'
                        ? 'pointer'
                        : 'file'
                    }
                    size={14}
                  />
                </span>
                <div className="wb-local-saved">
                  <strong>{e.label}</strong>
                  <span className="wb-muted" title={e.files.join('\n')}>
                    {fileNames(e.files)}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => undo(e.id, e.kind)}
                >
                  Undo
                </button>
              </li>
            ))}
          </ul>
          <div className="wb-local-row">
            {needsBranch && (
              <label className="wb-local-branch">
                New branch
                <input
                  value={branch}
                  onChange={(ev) => setBranch(ev.target.value.trim())}
                  aria-invalid={!BRANCH.test(branch)}
                  spellCheck={false}
                />
              </label>
            )}
            <button
              type="button"
              className="wb-button wb-button-primary"
              data-testid="wb-local-push"
              disabled={busy || (needsBranch && !BRANCH.test(branch))}
              onClick={push}
            >
              <Icon name="up" size={14} />
              Push {status.edits.length === 1 ? 'it' : 'them'}
            </button>
          </div>
          <p className="wb-muted">
            {status.edits.some((e) => e.kind === 'token') &&
              (status.protected
                ? `Token edits go to a new branch: you are on ${status.branch}. `
                : `Token edits go to ${status.branch}. `)}
            {status.edits.some(
              (e) => e.kind === 'style' || e.kind === 'agent'
            ) &&
              'Component edits go to their own heal branch off master, one small pull request.'}
          </p>
        </>
      )}
      {error && (
        <p className="wb-local-error" role="alert">
          {error}
        </p>
      )}
      {pushed && (
        <p className="wb-muted" role="status">
          {pushed}
        </p>
      )}
    </section>
  );
};

export default LocalSave;
