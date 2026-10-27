import { FormEvent, useEffect, useRef, useState } from 'react';

import { copyText } from '../lib/clipboard';
import {
  branchFor,
  EMPTY,
  epicReviewUrl,
  freshKeys,
  isDone,
  Item,
  prUrl,
  randomTag,
  SendRecord,
  sendText,
  since,
  statusText,
  unsentCount,
  withCopy,
} from '../lib/send';

import Icon from './Icon';

type Props = {
  record: SendRecord;
  update: (fn: (r: SendRecord) => SendRecord) => void;
  // GitHub answered the last question.
  answering: boolean;
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

// The one action of the Review page: send this browser's changes for review
// through the person's agent, then follow the review. The button says where
// it stands; it opens a modal with the text for the agent.
const SendForReview = ({
  record,
  update,
  answering,
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
  const text = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  // A copied text goes stale as soon as the changes do.
  useEffect(() => setCopied(undefined), [current]);

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
  const body = () => {
    const all = items();
    const fresh = all.filter((i) => toSend.changed.includes(i.key));
    const tasks = fresh
      .filter((i) => i.task)
      .map((i) =>
        record.sent[i.key]
          ? `again (sent before as ${record.sent[i.key].value}):\n${i.task}`
          : i.task
      );
    return sendText({
      branch,
      pr: record.pr,
      items: tasks,
      gone: toSend.gone.map((k) => record.sent[k].undo),
      tokenPatch: tokenPatch(
        fresh.map((i) => i.key).filter((k) => k.startsWith('token:'))
      ),
    });
  };

  const copy = async () => {
    const ok = await copyText(body());
    update((r) => withCopy(r, items()));
    setCopied(ok ? 'ok' : 'manual');
    if (!ok && text.current) {
      window.getSelection()?.selectAllChildren(text.current);
    }
  };

  const fresh = () => {
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

  const first = !linked;
  return (
    <>
      <button
        type="button"
        className={`wb-button${unsent > 0 || done ? ' wb-button-primary' : ''}`}
        onClick={() => (done ? fresh() : show())}
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
            <p>
              {first
                ? 'Give this to your agent. It asks you who should review it, sends it, and tells you when it is there.'
                : 'Give this to your agent. It adds these to the review and tells you when the preview shows them.'}
            </p>
            <pre
              ref={text}
              className="wb-review-text"
              tabIndex={0}
              data-testid="wb-send-text"
            >
              {open ? body() : ''}
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
            <a href={epicReviewUrl(record.pr)} target="_blank" rel="noreferrer">
              See it on its preview
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
