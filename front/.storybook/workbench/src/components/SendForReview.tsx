import { FormEvent, useEffect, useRef, useState } from 'react';

import { copyText } from '../lib/clipboard';
import { resolveItems } from '../lib/patch';
import {
  branchFor,
  EMPTY,
  epicReviewUrl,
  freshKeys,
  isDone,
  Item,
  LineEdit,
  lineEditOfUndo,
  prUrl,
  randomTag,
  REVIEWERS,
  SendRecord,
  sendText,
  since,
  statusText,
  unsentCount,
  withCopy,
} from '../lib/send';
import type { PreviewState } from '../lib/useSend';

import Icon from './Icon';

type Props = {
  record: SendRecord;
  update: (fn: (r: SendRecord) => SendRecord) => void;
  // GitHub answered the last question.
  answering: boolean;
  // Whether the linked review's preview is up yet.
  preview?: PreviewState;
  current: Record<string, string>;
  // Every change of this browser, with its task and its put-back line.
  items: () => Item[];
  // The tokens.source.json patch for these token keys (`token:<name>`).
  tokenPatch: (keys: string[]) => string;
  // The first changed component, for the branch name.
  component: string;
  // Drops these changes from the browser (Start fresh after a merge).
  drop: (keys: string[]) => void;
};

// What the header says after "N changes ·".
export const sendLine = (record: SendRecord, count: number) => {
  if (record.pr) {
    if (!record.status) return `review #${record.pr}`;
    const t = statusText(record.status);
    // A name keeps its capital.
    return record.status.state === 'changes'
      ? t
      : t[0].toLowerCase() + t.slice(1);
  }
  if (record.pending) return 'waiting for your agent';
  return count > 0 ? 'not sent yet' : '';
};

const fileName = (file: string) => file.split('/').pop() ?? file;

// The exact edits, as a person reads a diff: where, the line now, the line
// after.
const Diff = ({ edits, byHand }: { edits: LineEdit[]; byHand: number }) => (
  <div className="wb-send-diff" data-testid="wb-send-diff">
    {edits.map((e) => (
      <figure key={`${e.file}:${e.line}:${e.new}`}>
        <figcaption title={e.file}>
          {fileName(e.file)}:{e.line}
        </figcaption>
        <pre>
          <del>- {e.old.trim()}</del>
          {'\n'}
          <ins>+ {e.new.trim()}</ins>
        </pre>
      </figure>
    ))}
    {byHand > 0 && (
      <p className="wb-muted">
        {byHand === 1 ? 'One change' : `${byHand} changes`} your agent makes by
        hand.
      </p>
    )}
  </div>
);

// The one action of the Review page: send this browser's changes for review
// through the person's agent, then follow the review. The button says where
// it stands; it opens a modal: who reviews, what changes, the text.
const SendForReview = ({
  record,
  update,
  answering,
  preview,
  current,
  items,
  tokenPatch,
  component,
  drop,
}: Props) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<'ok' | 'manual' | undefined>();
  const [linking, setLinking] = useState(false);
  // The items with their exact edits, read from GitHub when the modal opens.
  const [ready, setReady] = useState<Item[] | undefined>();
  const text = useRef<HTMLPreElement>(null);
  const itemsNow = useRef(items);
  itemsNow.current = items;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  // A copied text goes stale as soon as the changes do.
  useEffect(() => setCopied(undefined), [current]);
  useEffect(() => {
    if (!open) return;
    let live = true;
    setReady(undefined);
    resolveItems(itemsNow.current()).then((r) => live && setReady(r));
    return () => {
      live = false;
    };
  }, [open, current]);

  const unsent = unsentCount(current, record);
  const linked = !!record.pr;
  const done = isDone(record.status);
  const toSend = since(current, record.sent);
  const anything = toSend.changed.length + toSend.gone.length > 0;
  if (!linked && !record.pending && unsent === 0) return null;

  const label = done
    ? 'Start fresh'
    : unsent > 0
    ? linked || record.pending
      ? `Send ${unsent} more`
      : 'Send for review'
    : record.pending
    ? 'Waiting for your agent…'
    : statusText(record.status ?? { state: 'none', who: [] });

  // Picked when the modal first opens, kept until Start fresh or Unlink.
  const branch = record.branch ?? '';
  const show = () => {
    if (!record.branch) {
      update((r) => ({
        ...r,
        branch: r.branch ?? branchFor(component, randomTag()),
      }));
    }
    setOpen(true);
  };

  const fresh = (list: Item[]) =>
    list.filter((i) => toSend.changed.includes(i.key));
  // A change sent before is edited from the line it left on the review.
  const editOf = (i: Item): LineEdit | undefined => {
    if (!i.edit) return undefined;
    const before = record.sent[i.key];
    const prev = before ? lineEditOfUndo(before.undo) : undefined;
    return prev ? { ...i.edit, old: prev.old } : i.edit;
  };
  const edits = (list: Item[]) =>
    fresh(list)
      .map(editOf)
      .filter((e): e is LineEdit => !!e);
  const byHand = (list: Item[]) => fresh(list).filter((i) => !i.edit && i.task);
  const reviewer = record.reviewer;
  const body = (list: Item[]) =>
    sendText({
      branch,
      pr: record.pr,
      reviewer: reviewer ?? null,
      edits: edits(list),
      tasks: byHand(list).map((i) =>
        record.sent[i.key]
          ? `again (sent before as ${record.sent[i.key].value}):\n${i.task}`
          : i.task
      ),
      gone: toSend.gone.map((k) => record.sent[k].undo),
      tokenPatch: tokenPatch(
        fresh(list)
          .map((i) => i.key)
          .filter((k) => k.startsWith('token:'))
      ),
    });

  const copy = async () => {
    if (!ready) return;
    const ok = await copyText(body(ready));
    update((r) => withCopy(r, ready));
    setCopied(ok ? 'ok' : 'manual');
    if (!ok && text.current) {
      window.getSelection()?.selectAllChildren(text.current);
    }
  };

  const restart = () => {
    drop(freshKeys(current, record));
    update(() => EMPTY);
  };

  const link = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const n = Number(new FormData(e.currentTarget).get('pr'));
    if (!Number.isInteger(n) || n <= 0) return;
    update((r) => ({ ...r, pr: n, head: undefined, status: undefined }));
    setLinking(false);
  };

  const pick = (login: string | null) =>
    update((r) => ({ ...r, reviewer: login }));
  const picked = reviewer !== undefined;
  const first = !linked;
  return (
    <>
      <button
        type="button"
        className={`wb-button${unsent > 0 || done ? ' wb-button-primary' : ''}`}
        onClick={() => (done ? restart() : show())}
        data-testid="wb-review-send"
      >
        {!done && <Icon name={unsent > 0 ? 'copy' : 'check'} size={16} />}
        {label}
      </button>
      <dialog
        ref={dialog}
        className="wb-send"
        aria-labelledby="wb-send-title"
        onClose={() => setOpen(false)}
        data-testid="wb-send"
      >
        <div className="wb-send-head">
          <h2 id="wb-send-title">{label}</h2>
          <button
            type="button"
            className="wb-icon-button"
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        {anything && (
          <>
            <div
              className="wb-send-who"
              role="radiogroup"
              aria-label={first ? 'Who should review it?' : 'Who looks again?'}
            >
              <span>
                {first ? 'Who should review it?' : 'Who looks again?'}
              </span>
              {[
                ...REVIEWERS.map((r) => [r.name, r.login] as const),
                ['None', null] as const,
              ].map(([name, login]) => (
                <button
                  key={name}
                  type="button"
                  role="radio"
                  aria-checked={picked && reviewer === login}
                  className="wb-chip"
                  onClick={() => pick(login)}
                  title={login ? `@${login}` : 'Nobody is asked: a test'}
                  data-testid={`wb-send-who-${name.toLowerCase()}`}
                >
                  {name}
                </button>
              ))}
            </div>
            {!picked ? null : !ready ? (
              <p className="wb-muted" data-testid="wb-send-reading">
                Reading the code on GitHub…
              </p>
            ) : (
              <>
                <Diff edits={edits(ready)} byHand={byHand(ready).length} />
                <p>
                  {first
                    ? 'Give this to your agent. It sends it for review in seconds and gives you the link.'
                    : 'Give this to your agent. It adds these to the review in seconds.'}
                </p>
                <pre
                  ref={text}
                  className="wb-review-text"
                  tabIndex={0}
                  data-testid="wb-send-text"
                >
                  {open ? body(ready) : ''}
                </pre>
                <div className="wb-send-actions">
                  {copied === 'manual' && (
                    <span className="wb-muted">Selected: copy it by hand.</span>
                  )}
                  <button
                    type="button"
                    className="wb-button wb-button-primary"
                    onClick={copy}
                    data-testid="wb-send-copy"
                  >
                    <Icon name={copied === 'ok' ? 'check' : 'copy'} size={16} />
                    {copied === 'ok' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </>
            )}
          </>
        )}
        <p className="wb-send-status" data-testid="wb-send-status">
          {record.pending
            ? 'Waiting for your agent…'
            : record.status
            ? statusText(record.status)
            : linked
            ? `Review #${record.pr}`
            : 'Not sent yet'}
          {!answering && (
            <span className="wb-muted"> · GitHub isn&apos;t answering</span>
          )}
        </p>
        {linked && record.pr && (
          <p className="wb-send-links">
            <a href={prUrl(record.pr)} target="_blank" rel="noreferrer">
              Open the review
            </a>
            <a
              href={epicReviewUrl(record.pr)}
              target="_blank"
              rel="noreferrer"
              data-testid="wb-send-preview"
            >
              {preview === 'building'
                ? 'Its preview is on its way'
                : 'See it on its preview'}
            </a>
          </p>
        )}
        <div className="wb-send-foot">
          {linked ? (
            <button
              type="button"
              className="wb-review-reset"
              onClick={() => update(() => EMPTY)}
            >
              Unlink
            </button>
          ) : linking ? (
            <form className="wb-review-connect" onSubmit={link}>
              <input
                name="pr"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Number"
                aria-label="Review number"
                autoFocus
              />
              <button type="submit" className="wb-button">
                Link
              </button>
            </form>
          ) : (
            <button
              type="button"
              className="wb-review-reset"
              onClick={() => setLinking(true)}
            >
              Link one by hand
            </button>
          )}
        </div>
      </dialog>
    </>
  );
};

export default SendForReview;
