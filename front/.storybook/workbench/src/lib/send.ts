// Send for review: the Review page hands this browser's changes to the
// person's agent as one text, names the branch the agent opens the PR on,
// and follows that PR through GitHub's public API. The branch is the
// bridge: the page never writes to GitHub and holds no key. The text is
// one command: scripts/design-system/send.js, fetched from GitHub, applies
// the exact line edits and opens the PR through the API (no clone). Pure
// functions; useSend.ts keeps the record and asks GitHub.
import type { EditSource } from './patch';

// Where a review goes; master once the workbench is merged.
export const REVIEW_BASE = 'design-system/workbench';
export const REPO = 'CitizenLabDotCo/citizenlab';

// The workbench's own PR: its preview is the "before" of every review.
export const WORKBENCH_PR = 15027;

// The script the agent runs, from the repository root.
export const SEND_SCRIPT = 'front/scripts/design-system/send.js';

// Who the person can ask, in this order. `null` asks nobody (a test): the
// review opens as a draft.
export const REVIEWERS: { name: string; login: string }[] = [
  { name: 'Amira', login: 'amirabayoumi' },
  { name: 'Edwin', login: 'EdwinKato' },
  { name: 'Luuc', login: 'luucvanderzee' },
  { name: 'Iva', login: 'IvaKop' },
];

export const SEND_KEY = 'gv-review-send';

// One change as the script applies it: line `line` of `file` (from the
// repository root) reads `old` and becomes `new`.
export type LineEdit = {
  subject: string;
  story?: string;
  file: string;
  line: number;
  old: string;
  new: string;
};

// What was handed over, per change: its value then and the line that puts
// it back if the person resets it later.
export type Sent = Record<string, { value: string; undo: string }>;

export type ReviewState =
  | 'review'
  | 'changes'
  | 'approved'
  | 'none'
  | 'merged'
  | 'closed';

export type ReviewStatus = { state: ReviewState; who: string[] };

export type SendRecord = {
  branch?: string;
  pr?: number;
  head?: string;
  status?: ReviewStatus;
  // Who the person picked; null = nobody (a test).
  reviewer?: string | null;
  // Confirmed: GitHub shows the agent's work for it.
  sent: Sent;
  // Copied, not confirmed yet; `head` is the PR's head at the copy.
  pending?: { sent: Sent; head?: string };
};

export const EMPTY: SendRecord = { sent: {} };

// One change of this browser, ready to send: `edit` when the page found its
// exact line, else `task` for the agent to do by hand. `undo` puts it back
// later: a LineEdit as JSON when there is one, else a line of words.
export type Item = {
  key: string;
  value: string;
  task: string;
  undo: string;
  // What resolveItems (patch.ts) reads the file for.
  source?: EditSource;
  edit?: LineEdit;
};

// The keys and values of this browser's changes: an element edit by its id,
// a token as `token:<name>`.
export const currentOf = (
  edits: { id: string; to: { value: string; token?: string } }[],
  overrides: Record<string, string | undefined>
): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const e of edits) out[e.id] = e.to.token ?? e.to.value;
  for (const [name, value] of Object.entries(overrides)) {
    if (typeof value === 'string') out[`token:${name}`] = value;
  }
  return out;
};

// What changed since `base`: keys new or with another value, and keys that
// were sent and are gone now.
export const since = (current: Record<string, string>, base: Sent) => ({
  changed: Object.keys(current).filter((k) => base[k]?.value !== current[k]),
  gone: Object.keys(base).filter((k) => !(k in current)),
});

// The count on the nav and on "Send N more": changes since the last copy.
// A review closed without merging landed nothing, so nothing sent to it
// needs putting back: every change here counts as unsent again.
export const unsentCount = (
  current: Record<string, string>,
  record: SendRecord
) => {
  const base =
    record.status?.state === 'closed'
      ? {}
      : record.pending?.sent ?? record.sent;
  const d = since(current, base);
  return d.changed.length + d.gone.length;
};

const cssValue = (v: { raw?: string; value?: string; token?: string }) =>
  v.token ? `var(${v.token})` : v.raw ?? v.value ?? '';

// The line that puts a sent edit back, should the person reset it later.
export const undoOfEdit = (
  e: {
    props: string[];
    from: { raw: string; token?: string };
    to: { value: string; token?: string };
  },
  component: string,
  file?: string
) =>
  `put back: ${component} · ${file ?? '(file unknown)'} · ${e.props.join(
    ', '
  )} ${cssValue(e.to)} → ${cssValue(e.from)}`;

export const undoOfToken = (name: string, value: string) =>
  `put back: tokens.source.json · ${name} to ${value}`;

// The line edit that puts a sent one back, kept as the undo line.
export const undoOfLineEdit = (e: LineEdit) =>
  JSON.stringify({
    ...e,
    subject: e.subject.replace(/^(design-system\([^)]*\):\s*)/, '$1put back '),
    old: e.new,
    new: e.old,
  });

// An undo line that is a line edit, or undefined for a line of words.
export const lineEditOfUndo = (undo: string): LineEdit | undefined => {
  if (!undo.startsWith('{')) return undefined;
  try {
    const e = JSON.parse(undo);
    return typeof e?.file === 'string' &&
      Number.isInteger(e.line) &&
      typeof e.old === 'string' &&
      typeof e.new === 'string' &&
      typeof e.subject === 'string'
      ? (e as LineEdit)
      : undefined;
  } catch {
    return undefined;
  }
};

export const snapshotOf = (items: Item[]): Sent =>
  Object.fromEntries(
    items.map((i) => [i.key, { value: i.value, undo: i.undo }])
  );

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
    .replace(/-+$/, '') || 'review';

// `design-system/button-k3f9`: the first component and four random
// characters, so two people sending the same component do not meet.
export const branchFor = (component: string, tag: string) =>
  `design-system/${slug(component)}-${tag}`;

export const randomTag = () => {
  const abc = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return [...bytes].map((b) => abc[b % abc.length]).join('');
};

export const previewOrigin = (pr: number) =>
  `https://pr-${pr}.epic.hq.govocal.com`;

export const epicReviewUrl = (pr: number) =>
  `${previewOrigin(pr)}/storybook/workbench/#/review`;

// A small file every preview's Storybook serves: it loads once the preview
// is up (the epic's Google sign-in covers every preview host).
export const previewProbeUrl = (pr: number, now = Date.now()) =>
  `${previewOrigin(pr)}/storybook/favicon.svg?t=${now}`;

export const prUrl = (pr: number) => `https://github.com/${REPO}/pull/${pr}`;

const PLAIN =
  'Talk to the person in plain words: "review", never PR, branch or commit.';

// What the agent runs: the script from the workbench on GitHub, fed the
// changes. Nothing to clone or install; GitHub runs the checks.
export const sendCommand = (input: object) =>
  [
    `gh api -H 'Accept: application/vnd.github.raw' 'repos/${REPO}/contents/${SEND_SCRIPT}?ref=${REVIEW_BASE}' > /tmp/gv-send.js && node /tmp/gv-send.js <<'EOF'`,
    JSON.stringify(input, null, 2),
    'EOF',
  ].join('\n');

const whoText = (reviewer: string | null) =>
  reviewer
    ? `it is with ${nameOf(reviewer)} for review`
    : 'it is sent and nobody is asked to look yet (a test)';

export type SendArgs = {
  branch: string;
  pr?: number;
  reviewer: string | null;
  edits: LineEdit[];
  tasks: string[];
  gone: string[];
  tokenPatch: string;
};

// What a send hands over: the script's input, and the lines of words done
// by hand. `gone` undo lines that are line edits go to the script.
const partsOf = ({
  branch,
  pr,
  reviewer,
  edits,
  tasks,
  gone,
  tokenPatch,
}: SendArgs) => {
  const putBack = gone.map(lineEditOfUndo);
  const changes = [...edits, ...putBack.filter((e): e is LineEdit => !!e)];
  const words = gone.filter((_, i) => !putBack[i]);
  const byHand = [
    ...tasks.flatMap((t) => ['', t]),
    ...(tokenPatch.trim()
      ? ['', 'tokens.source.json:', tokenPatch.trim()]
      : []),
    ...(words.length
      ? [
          '',
          'Put back (reset in the Workbench):',
          ...words.flatMap((t) => ['', t]),
        ]
      : []),
  ];
  const input = {
    repo: REPO,
    base: REVIEW_BASE,
    branch,
    ...(pr ? { pr } : {}),
    reviewer,
    changes,
  };
  return { changes, byHand, input };
};

// The command alone, for a terminal where gh is signed in: only when the
// script makes every change, so nothing is left for an agent.
export const terminalCommand = (args: SendArgs): string | undefined => {
  const { changes, byHand, input } = partsOf(args);
  return changes.length && !byHand.length ? sendCommand(input) : undefined;
};

// The text the person gives their agent. Without a PR the script opens one
// on `branch`; with one it adds to it. `edits` are the exact line edits;
// `tasks`, the token patch and `gone` lines of words are done by hand.
export const sendText = (args: SendArgs): string => {
  const { branch, pr, reviewer } = args;
  const { changes, byHand, input } = partsOf(args);
  const tell = `Tell the person ${whoText(
    reviewer
  )}, with the preview link it printed. Do not wait for the preview: the Workbench shows when it is ready.`;
  const head = pr
    ? [
        `More Workbench changes for review #${pr} (branch ${branch}, ${REPO}). ${PLAIN}`,
        '',
        '1. If its reviewer asked for changes, read their comments on GitHub first.',
      ]
    : [`Workbench changes to send for review (${REPO}). ${PLAIN}`];
  if (!changes.length) {
    // Nothing the script can apply: the review is made by hand.
    return [
      ...head,
      '',
      `${pr ? 2 : 1}. ${
        pr
          ? `One commit per change onto ${branch}`
          : `Make branch ${branch} off origin/${REVIEW_BASE}, one commit per change`
      } (heal skill, "Stacked on the workbench"), its last line "Story: <story id>"; no pictures. ${
        pr
          ? 'Ask the reviewer to look again.'
          : `Open the PR into ${REVIEW_BASE}: label epic; ${
              reviewer
                ? `ready for review, review requested from @${reviewer}`
                : 'a draft, nobody asked'
            }.`
      }`,
      `${pr ? 3 : 2}. ${tell}`,
      '',
      'Changes:',
      ...byHand,
    ].join('\n');
  }
  const step = pr ? 2 : 1;
  const hand = byHand.length > 0;
  return [
    ...head,
    '',
    `${step}. Run this as it is, in a terminal where gh is signed in to GitHub. It ${
      pr
        ? `adds the changes to review #${pr} and asks the reviewer to look again`
        : 'opens the review on GitHub'
    } in seconds:`,
    '',
    sendCommand(input),
    '',
    ...(hand
      ? [
          `${
            step + 1
          }. Then by hand on ${branch} (heal skill, "Stacked on the workbench"): each change under "By hand" below, and any change step ${step} printed as by hand. One commit per change, its last line "Story: <story id>"; no pictures.`,
          '',
        ]
      : []),
    `${step + (hand ? 2 : 1)}. ${tell}`,
    ...(hand ? ['', 'By hand:', ...byHand] : []),
  ].join('\n');
};

// ---------------------------------------------------------------- GitHub

export type GhPull = {
  number: number;
  state: 'open' | 'closed';
  merged_at: string | null;
  head: { sha: string };
  requested_reviewers?: { login: string }[];
};

export type GhReview = {
  user: { login: string } | null;
  state: string;
};

// Where the review stands: merged or closed first; then anyone asked and
// not answered yet; then the latest verdict per reviewer, changes over
// approvals. Reviews come oldest first.
export const statusOf = (pull: GhPull, reviews: GhReview[]): ReviewStatus => {
  if (pull.merged_at) return { state: 'merged', who: [] };
  if (pull.state === 'closed') return { state: 'closed', who: [] };
  const asked = (pull.requested_reviewers ?? []).map((r) => r.login);
  if (asked.length) return { state: 'review', who: asked };
  const verdict = new Map<string, string>();
  for (const r of reviews) {
    if (!r.user) continue;
    if (r.state === 'APPROVED' || r.state === 'CHANGES_REQUESTED') {
      verdict.set(r.user.login, r.state);
    }
  }
  const by = (s: string) =>
    [...verdict].filter(([, v]) => v === s).map(([login]) => login);
  if (by('CHANGES_REQUESTED').length) {
    return { state: 'changes', who: by('CHANGES_REQUESTED') };
  }
  if (by('APPROVED').length) return { state: 'approved', who: by('APPROVED') };
  return { state: 'none', who: [] };
};

export const nameOf = (login: string) =>
  REVIEWERS.find((r) => r.login.toLowerCase() === login.toLowerCase())?.name ??
  `@${login}`;

const names = (who: string[]) => who.map(nameOf).join(' and ');

export const statusText = (s: ReviewStatus): string => {
  switch (s.state) {
    case 'review':
      return `With ${names(s.who)} for review`;
    case 'changes':
      return `${names(s.who)} asked for changes`;
    case 'approved':
      return `Approved by ${names(s.who)}`;
    case 'merged':
      return 'Merged';
    case 'closed':
      return 'Closed without merging';
    default:
      return 'Waiting for a reviewer';
  }
};

export const isDone = (s?: ReviewStatus) =>
  s?.state === 'merged' || s?.state === 'closed';

// A GitHub answer on the record: the PR is linked, its state kept, and a
// pending copy becomes sent once the agent's work shows (the PR found, or
// its head moved since the copy).
export const withPull = (
  record: SendRecord,
  pull: GhPull,
  reviews: GhReview[]
): SendRecord => {
  const p = record.pending;
  const landed = !!p && (record.pr === undefined || pull.head.sha !== p.head);
  return {
    ...record,
    pr: pull.number,
    head: pull.head.sha,
    status: statusOf(pull, reviews),
    sent: landed && p ? p.sent : record.sent,
    pending: landed ? undefined : p,
  };
};

// A copy: everything current is handed over, confirmed once GitHub shows it.
export const withCopy = (record: SendRecord, items: Item[]): SendRecord => ({
  ...record,
  pending: { sent: snapshotOf(items), head: record.head },
});

// Start fresh after a merge: the changes that went in are dropped (the
// caller removes the keys returned), the link goes; after a close only the
// link goes and the changes stay to send again.
export const freshKeys = (
  current: Record<string, string>,
  record: SendRecord
): string[] =>
  record.status?.state === 'merged'
    ? Object.keys(current).filter((k) => record.sent[k]?.value === current[k])
    : [];
