// Send for review: the Review page hands this browser's changes to the
// person's agent as one text, names the branch the agent opens the PR on,
// and follows that PR through GitHub's public API. The branch is the
// bridge: the page never writes to GitHub and holds no key. Pure functions;
// useSend.ts keeps the record and asks GitHub.

// Where a review goes; master once the workbench is merged.
export const REVIEW_BASE = 'design-system/workbench';
export const REPO = 'CitizenLabDotCo/citizenlab';

// Who the agent offers as reviewer, in this order.
export const REVIEWERS: { name: string; login: string }[] = [
  { name: 'Amira', login: 'amirabayoumi' },
  { name: 'Edwin', login: 'EdwinKato' },
  { name: 'Luuc', login: 'luucvanderzee' },
  { name: 'Iva', login: 'IvaKop' },
];

export const SEND_KEY = 'gv-review-send';

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
  // Confirmed: GitHub shows the agent's work for it.
  sent: Sent;
  // Copied, not confirmed yet; `head` is the PR's head at the copy.
  pending?: { sent: Sent; head?: string };
};

export const EMPTY: SendRecord = { sent: {} };

// One change of this browser, ready to send.
export type Item = { key: string; value: string; task: string; undo: string };

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
export const unsentCount = (
  current: Record<string, string>,
  record: SendRecord
) => {
  const d = since(current, record.pending?.sent ?? record.sent);
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

export const epicReviewUrl = (pr: number) =>
  `https://pr-${pr}.epic.hq.govocal.com/storybook/workbench/#/review`;

export const prUrl = (pr: number) => `https://github.com/${REPO}/pull/${pr}`;

const PLAIN =
  'Talk to the person in plain words: "review", never PR, branch or commit.';

const reviewerList = REVIEWERS.map((r) => `${r.name} (@${r.login})`).join(', ');

// The text the person gives their agent. Without a PR it opens one on
// `branch`; with one it adds to it. `items` are the changes to make, `gone`
// the lines that put back what was sent and reset since.
export const sendText = ({
  branch,
  pr,
  items,
  gone,
  tokenPatch,
}: {
  branch: string;
  pr?: number;
  items: string[];
  gone: string[];
  tokenPatch: string;
}): string => {
  const head = pr
    ? [
        `More Workbench changes for review #${pr} (branch ${branch}, ${REPO}). ${PLAIN}`,
        '',
        '1. If its reviewer asked for changes, read their comments first and answer them in these commits.',
        `2. One commit per change onto ${branch}, the same way as before (heal skill, "Stacked on the workbench"): its before and after pictures in .storybook/static/changes/<sha>/, all in one pictures commit after the last change.`,
        `3. Ask the reviewer to look again. When the preview has redeployed, open ${epicReviewUrl(
          pr
        )}, check each card shows its change, then tell the person, with that link.`,
      ]
    : [
        `Workbench changes to send for review. ${PLAIN}`,
        '',
        `1. Ask who should review it, offering in this order: ${reviewerList}.`,
        `2. In ${REPO}, make branch ${branch} off origin/${REVIEW_BASE}. Heal skill ("Stacked on the workbench"): one commit per change, its before and after pictures in .storybook/static/changes/<sha>/, all in one pictures commit after the last change.`,
        `3. Open the PR into ${REVIEW_BASE}: ready for review, label epic, review requested from the person picked.`,
        `4. When its preview is up, open https://pr-<n>.epic.hq.govocal.com/storybook/workbench/#/review, check each card shows its change, then tell the person it is with the reviewer, with that link.`,
      ];
  return [
    ...head,
    ...(items.length || tokenPatch.trim()
      ? ['', 'Changes:', ...items.flatMap((t) => ['', t])]
      : []),
    ...(tokenPatch.trim()
      ? ['', 'tokens.source.json:', tokenPatch.trim()]
      : []),
    ...(gone.length
      ? [
          '',
          'Put back (reset in the Workbench):',
          ...gone.flatMap((t) => ['', t]),
        ]
      : []),
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
