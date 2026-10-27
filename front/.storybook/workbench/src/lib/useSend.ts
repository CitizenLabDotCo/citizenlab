import { useCallback, useEffect, useRef, useState } from 'react';

import {
  EMPTY,
  GhPull,
  GhReview,
  isDone,
  previewProbeUrl,
  REPO,
  REVIEWERS,
  SEND_KEY,
  SendRecord,
  withPull,
} from './send';

// Said on window when one view changes the record, so the others (the
// Review page, the nav count) read it again.
const CHANGED = 'gv-review-send-changed';
const BRANCH = /^design-system\/[a-z0-9-]{1,60}$/;

// Where the record lives when the browser keeps nothing (a private window):
// this visit only.
let memory: SendRecord = EMPTY;

const stored = (): string | null | undefined => {
  try {
    return window.localStorage.getItem(SEND_KEY);
  } catch {
    return undefined;
  }
};

// The stored record, or an empty one; a branch that is not ours is dropped
// (it goes into a text and a GitHub query).
const read = (): SendRecord => {
  const text = stored();
  if (text === undefined) return memory;
  try {
    const r = JSON.parse(text ?? '');
    if (!r || typeof r !== 'object' || typeof r.sent !== 'object') {
      return EMPTY;
    }
    const pr = Number.isInteger(r.pr) && r.pr > 0 ? r.pr : undefined;
    const branch =
      typeof r.branch === 'string' && BRANCH.test(r.branch)
        ? r.branch
        : undefined;
    // One of the four, or null (nobody); it goes into the text too.
    const reviewer =
      r.reviewer === null || REVIEWERS.some((x) => x.login === r.reviewer)
        ? (r.reviewer as string | null)
        : undefined;
    return { ...r, pr, branch, reviewer };
  } catch {
    return EMPTY;
  }
};

// This browser's send-for-review record, shared by every view.
export const useSendRecord = () => {
  const [record, setRecord] = useState<SendRecord>(read);
  useEffect(() => {
    const sync = () =>
      setRecord((now) => {
        const next = read();
        return JSON.stringify(next) === JSON.stringify(now) ? now : next;
      });
    window.addEventListener(CHANGED, sync);
    // Another tab.
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGED, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  const update = useCallback((fn: (r: SendRecord) => SendRecord) => {
    const next = fn(read());
    memory = next;
    try {
      window.localStorage.setItem(SEND_KEY, JSON.stringify(next));
    } catch {
      // Kept for this visit only.
    }
    setRecord(next);
    window.dispatchEvent(new Event(CHANGED));
  }, []);
  return { record, update };
};

const API = `https://api.github.com/repos/${REPO}`;

const get = async <T>(path: string): Promise<T> => {
  const r = await fetch(`${API}${path}`, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!r.ok) throw new Error(`GitHub ${r.status}`);
  return r.json() as Promise<T>;
};

const WAIT_MS = 2 * 60 * 1000;

// Asks GitHub's public API where the review stands: on opening, when the tab
// comes back, and every 2 minutes while a copy waits for the agent. Returns
// false while GitHub is not answering (the record keeps its last answer).
export const useReviewWatch = (
  record: SendRecord,
  update: (fn: (r: SendRecord) => SendRecord) => void
) => {
  const [answering, setAnswering] = useState(true);
  const now = useRef(record);
  now.current = record;
  // One question at a time (focus and visibility fire together).
  const busy = useRef(false);

  const check = useCallback(async () => {
    const r = now.current;
    if (isDone(r.status) || busy.current) return;
    busy.current = true;
    try {
      if (r.pr) {
        const n = r.pr;
        const [pull, reviews] = await Promise.all([
          get<GhPull>(`/pulls/${n}`),
          get<GhReview[]>(`/pulls/${n}/reviews?per_page=100`),
        ]);
        update((x) => (x.pr === n ? withPull(x, pull, reviews) : x));
      } else if (r.branch && r.pending) {
        const branch = r.branch;
        const head = encodeURIComponent(`${REPO.split('/')[0]}:${branch}`);
        const [pull] = await get<GhPull[]>(
          `/pulls?head=${head}&state=all&per_page=1`
        );
        if (pull) {
          update((x) =>
            x.branch === branch && !x.pr ? withPull(x, pull, []) : x
          );
        }
      }
      setAnswering(true);
    } catch {
      setAnswering(false);
    } finally {
      busy.current = false;
    }
  }, [update]);

  const waiting = !!record.pending;
  useEffect(() => {
    check();
  }, [check, record.pr, record.branch, waiting]);
  useEffect(() => {
    const onFocus = () => document.visibilityState === 'visible' && check();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    const timer = waiting ? window.setInterval(check, WAIT_MS) : undefined;
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      if (timer) window.clearInterval(timer);
    };
  }, [check, waiting]);
  return answering;
};

export type PreviewState = 'building' | 'ready';

const PROBE_MS = 60 * 1000;

// Whether a review's preview is up: a small file of its Storybook loads (the
// epic's sign-in covers every preview host). Asked every minute until it is.
export const usePreviewState = (pr?: number, done?: boolean) => {
  const [state, setState] = useState<PreviewState | undefined>();
  useEffect(() => {
    setState(undefined);
    if (!pr || done) return;
    let live = true;
    let timer: number | undefined;
    const probe = () => {
      const img = new Image();
      img.onload = () => live && setState('ready');
      img.onerror = () => {
        if (!live) return;
        setState('building');
        timer = window.setTimeout(probe, PROBE_MS);
      };
      img.src = previewProbeUrl(pr);
    };
    probe();
    return () => {
      live = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [pr, done]);
  return state;
};
