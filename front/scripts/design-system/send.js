// Send for review: the design workbench's changes become commits on a
// design-system/ branch and a review (PR), through GitHub's API alone: no
// clone, no install, no local checks, so a send takes seconds. The person's
// agent fetches this file from the workbench branch and runs it with the
// workbench's JSON on stdin; `--dry-run` does every read, prints the plan and
// writes nothing. CommonJS on Node's built-ins, so plain `node` runs it as
// fetched and jest imports it.
'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');

const REPO = 'CitizenLabDotCo/citizenlab';
const OWNER = 'CitizenLabDotCo';
const BASES = ['design-system/workbench', 'master'];
const BRANCH = /^design-system\/[a-z0-9-]{1,60}$/;
const LOGIN = /^[A-Za-z0-9-]{1,39}$/;
const STORY = /^[a-z0-9-]+--[a-z0-9-]+$/;
const NEWLINE = /[\r\n]/;

const APP_FILE = 'front/app/containers/App/index.tsx';
const TENANT_FILE = 'front/app/containers/App/TenantTokens.tsx';
const TOKENS_CSS = 'design-system/tokens/tokens.css';

const SETUP_SUBJECT =
  "design-system(setup): the app loads the tokens and writes each city's colours [AI-assisted]";
const SETUP_BODY = `app/containers/App/index.tsx imports design-system/tokens/tokens.css, so
var(--gv-*) reads resolve on the platform, and renders TenantTokens inside
its ThemeProvider: the city's primary, secondary and text colours and its
font go into --gv-tenant-primary, --gv-tenant-secondary, --gv-tenant-text
and --gv-font-family, as the workbench's Storybook does. tokens.css only
declares custom properties on :root: nothing renders differently until a
component reads one.`;

// The file the setup adds, byte for byte.
const TENANT_TOKENS = `import { useEffect } from 'react';

import { useTheme } from 'styled-components';

const setOrClear = (name: string, value?: string) => {
  const style = document.documentElement.style;
  if (value) style.setProperty(name, value);
  else style.removeProperty(name);
};

/**
 * Writes the city's colours and font from the theme into the
 * --gv-tenant-* and --gv-font-family slots of design-system/tokens/tokens.css,
 * so a token read shows this city's colours instead of the file's defaults.
 * Renders nothing.
 */
const TenantTokens = () => {
  const { colors, fontFamily } = useTheme();
  const { tenantPrimary, tenantSecondary, tenantText } = colors;

  useEffect(() => {
    setOrClear('--gv-tenant-primary', tenantPrimary);
    setOrClear('--gv-tenant-secondary', tenantSecondary);
    setOrClear('--gv-tenant-text', tenantText);
    setOrClear('--gv-font-family', fontFamily);
  }, [tenantPrimary, tenantSecondary, tenantText, fontFamily]);

  return null;
};

export default TenantTokens;
`;

// Each setup line goes in on the line after its anchor.
const SETUP_LINES = [
  [
    "import GlobalStyle from 'global-styles';",
    "import 'design-system/tokens/tokens.css';",
  ],
  [
    "import UserSessionRecordingModalManager from './ModalQueue/modals/UserSessionRecording/ModalManager';",
    "import TenantTokens from './TenantTokens';",
  ],
  ['          <GlobalStyle />', '          <TenantTokens />'],
];

const FOOTER = 'Sent from the design workbench (Send for review).';

const short = (sha) => String(sha).slice(0, 7);
const reviewUrl = (n) => `https://github.com/${REPO}/pull/${n}`;
const previewUrl = (n) =>
  `https://pr-${n}.epic.hq.govocal.com/storybook/workbench/#/review`;
const isText = (v) => typeof v === 'string';

// ------------------------------------------------------------- the input

const changeProblems = (c) => {
  if (!c || typeof c !== 'object' || Array.isArray(c)) {
    return ['must be an object'];
  }
  const problems = [];
  if (!isText(c.subject) || !c.subject.trim() || NEWLINE.test(c.subject)) {
    problems.push('subject must be one line of text');
  }
  if (c.body != null && !isText(c.body)) problems.push('body must be text');
  if (c.story != null && !(isText(c.story) && STORY.test(c.story))) {
    problems.push('story must be a story id like components-button--default');
  }
  if (
    !isText(c.file) ||
    !c.file.startsWith('front/app/') ||
    c.file.includes('..') ||
    /\/\/|\/$|[\0\r\n\\]/.test(c.file)
  ) {
    problems.push('file must be a file under front/app/');
  }
  if (!Number.isInteger(c.line) || c.line < 1) {
    problems.push('line must be a positive integer');
  }
  if (!isText(c.old) || NEWLINE.test(c.old)) {
    problems.push('old must be one line');
  }
  if (!isText(c.new) || NEWLINE.test(c.new)) {
    problems.push('new must be one line');
  }
  if (isText(c.old) && c.old === c.new) {
    problems.push('old and new are the same');
  }
  return problems;
};

// Everything wrong with the input, found before any call; empty when it can
// go. The branch may not be a base: the send would push straight onto it.
const validate = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return ['the input must be a JSON object'];
  }
  const problems = [];
  if (input.repo !== REPO) problems.push(`repo must be ${REPO}`);
  if (!BASES.includes(input.base)) {
    problems.push(`base must be ${BASES.join(' or ')}`);
  }
  if (
    !isText(input.branch) ||
    !BRANCH.test(input.branch) ||
    BASES.includes(input.branch)
  ) {
    problems.push('branch must be design-system/<a-z 0-9 -> and not a base');
  }
  if (input.pr != null && !(Number.isInteger(input.pr) && input.pr > 0)) {
    problems.push('pr must be a positive integer when given');
  }
  if (
    input.reviewer != null &&
    !(isText(input.reviewer) && LOGIN.test(input.reviewer))
  ) {
    problems.push('reviewer must be a GitHub login or null');
  }
  if (!Array.isArray(input.changes) || !input.changes.length) {
    problems.push('changes must hold at least one change');
  } else {
    input.changes.forEach((c, i) =>
      changeProblems(c).forEach((p) => problems.push(`change ${i + 1}: ${p}`))
    );
  }
  return problems;
};

// ------------------------------------------------------------ the edits

const count = (lines, line) => lines.filter((l) => l === line).length;

// One line swapped. The file may have moved on since the workbench read it:
// `old` found once elsewhere is still the line meant, and a change someone
// already made reads as 'already'. Anything else is for a person. Splitting
// and joining on '\n' keeps the trailing newline as it was.
const applyLineEdit = (text, change) => {
  const lines = text.split('\n');
  const at = change.line - 1;
  const swap = (i) => {
    lines[i] = change.new;
    return { text: lines.join('\n'), status: 'changed' };
  };
  if (lines[at] === change.old) return swap(at);
  if (count(lines, change.old) === 1) return swap(lines.indexOf(change.old));
  if (
    !count(lines, change.old) &&
    (lines[at] === change.new || count(lines, change.new) === 1)
  ) {
    return { text, status: 'already' };
  }
  return { text, status: 'moved' };
};

// App/index.tsx with the setup's three lines in, or null when an anchor is
// gone or doubled, or the file is half set up already (a second
// TenantTokens import would not compile).
const setupApp = (text) => {
  if (text.includes(TOKENS_CSS) || text.includes('TenantTokens')) return null;
  const lines = text.split('\n');
  const at = SETUP_LINES.map(([anchor]) =>
    count(lines, anchor) === 1 ? lines.indexOf(anchor) : -1
  );
  if (at.includes(-1)) return null;
  // Bottom up, so the anchors above keep their place.
  SETUP_LINES.map(([, line], i) => [at[i], line])
    .sort((a, b) => b[0] - a[0])
    .forEach(([i, line]) => lines.splice(i + 1, 0, line));
  return lines.join('\n');
};

const messageOf = (change) =>
  [
    change.subject,
    change.body ? change.body.trim() : '',
    change.story ? `Story: ${change.story}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

const titleOf = (entries) =>
  entries.length > 1
    ? `${entries[0].subject} (+${entries.length - 1} more)`
    : entries[0].subject;

// --------------------------------------------------------- the review text

const listLine = (k, entry) => `${k}. ${entry.subject} (${short(entry.sha)})`;
const ITEM = /^(\d+)\.\s/;

// The review's description: where to see it and what is in it.
const prBody = (n, entries, setupSha) =>
  [
    '## Review',
    '',
    previewUrl(n),
    '',
    ...entries.map((e, i) => listLine(i + 1, e)),
    '',
    setupSha
      ? `${FOOTER} The setup commit ${short(
          setupSha
        )} makes the app load the tokens.`
      : FOOTER,
  ].join('\n');

// More entries at the end of the description's numbered list (the first
// one under "## Review"), numbered on; everything else stays as it was.
const appendToBody = (body, entries) => {
  const lines = (body || '').split(/\r?\n/);
  const header = lines.findIndex((l) => /^##\s+Review\s*$/.test(l));
  const first = lines.findIndex((l, i) => i > header && ITEM.test(l));
  if (first === -1) {
    const list = entries.map((e, i) => listLine(i + 1, e)).join('\n');
    return `${lines.join('\n').trimEnd()}\n\n${list}`.trimStart();
  }
  let last = first;
  while (last + 1 < lines.length && ITEM.test(lines[last + 1])) last++;
  const from = Number(lines[last].split('.')[0]) + 1;
  lines.splice(last + 1, 0, ...entries.map((e, i) => listLine(from + i, e)));
  return lines.join('\n');
};

// -------------------------------------------------------- GitHub, reading

const getRef = async (api, branch) => {
  try {
    const ref = await api('GET', `/repos/${REPO}/git/ref/heads/${branch}`);
    return ref.object.sha;
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
};

// A file's text at a commit, or null when it is not there.
const readText = async (api, path, ref) => {
  const at = path.split('/').map(encodeURIComponent).join('/');
  let file;
  try {
    file = await api('GET', `/repos/${REPO}/contents/${at}?ref=${ref}`);
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
  if (!file || Array.isArray(file) || file.type !== 'file') return null;
  // Over 1 MB the contents API leaves the text out; the blob still has it.
  const blob =
    file.encoding === 'base64'
      ? file
      : await api('GET', `/repos/${REPO}/git/blobs/${file.sha}`);
  return Buffer.from(blob.content, 'base64').toString('utf8');
};

// The commits on the branch past `base` that an earlier send of these
// changes made: a run that stopped after its push left them out of the
// description, or left no review at all. Merges are not changes.
const earlierCommits = async (api, base, head, subjects) => {
  const { commits } = await api(
    'GET',
    `/repos/${REPO}/compare/${base}...${head}`
  );
  return commits
    .filter((c) => c.parents.length === 1)
    .map((c) => ({ sha: c.sha, subject: c.commit.message.split('\n')[0] }))
    .filter((c) => c.subject === SETUP_SUBJECT || subjects.has(c.subject))
    .map((c) => ({ ...c, setup: c.subject === SETUP_SUBJECT }));
};

// What a send commits on `start`, from reads alone: the setup first when the
// app lacks it (and only with a change to go with it), then one commit per
// change that applies. A commit carries every file changed up to it, so its
// tree builds from the starting tree without waiting for the one before.
const plan = async (api, input, start, compareBase) => {
  const paths = [...new Set([APP_FILE, ...input.changes.map((c) => c.file)])];
  const subjects = new Set(input.changes.map((c) => c.subject));
  const [read, earlier] = await Promise.all([
    Promise.all(paths.map((p) => readText(api, p, start))),
    compareBase ? earlierCommits(api, compareBase, start, subjects) : [],
  ]);
  const texts = new Map(paths.map((p, i) => [p, read[i]]));
  const changed = new Map();
  const out = { commits: [], already: [], byHand: [], earlier };

  let setup = null;
  const app = texts.get(APP_FILE);
  if (app == null) {
    out.byHand.push('the app setup (App/index.tsx is missing)');
  } else if (!app.includes(TOKENS_CSS)) {
    const next = setupApp(app);
    if (next == null) {
      out.byHand.push('the app setup (anchors moved)');
    } else {
      setup = new Map([
        [TENANT_FILE, TENANT_TOKENS],
        [APP_FILE, next],
      ]);
      setup.forEach((text, path) => {
        texts.set(path, text);
        changed.set(path, text);
      });
    }
  }

  for (const c of input.changes) {
    const text = texts.get(c.file);
    if (text == null) {
      out.byHand.push(`${c.subject} (no such file)`);
      continue;
    }
    const edit = applyLineEdit(text, c);
    if (edit.status === 'already') {
      out.already.push(c.subject);
    } else if (edit.status === 'moved') {
      out.byHand.push(`${c.subject} (the line moved)`);
    } else {
      texts.set(c.file, edit.text);
      changed.set(c.file, edit.text);
      out.commits.push({
        subject: c.subject,
        message: messageOf(c),
        setup: false,
        files: new Map(changed),
      });
    }
  }
  if (setup && out.commits.length) {
    out.commits.unshift({
      subject: SETUP_SUBJECT,
      message: `${SETUP_SUBJECT}\n\n${SETUP_BODY}`,
      setup: true,
      files: setup,
    });
  }
  return out;
};

// -------------------------------------------------------- GitHub, writing

// The planned commits as git objects on `start`: blobs and trees at once,
// then the commits in order. No ref moves here; returns the commit shas.
const push = async (api, start, commits) => {
  const texts = [...new Set(commits.flatMap((c) => [...c.files.values()]))];
  const [head, ...blobs] = await Promise.all([
    api('GET', `/repos/${REPO}/git/commits/${start}`),
    ...texts.map((content) =>
      api('POST', `/repos/${REPO}/git/blobs`, { content, encoding: 'utf-8' })
    ),
  ]);
  const blobOf = new Map(texts.map((text, i) => [text, blobs[i].sha]));
  const trees = await Promise.all(
    commits.map((c) =>
      api('POST', `/repos/${REPO}/git/trees`, {
        base_tree: head.tree.sha,
        tree: [...c.files].map(([path, text]) => ({
          path,
          mode: '100644',
          type: 'blob',
          sha: blobOf.get(text),
        })),
      })
    )
  );
  const shas = [];
  for (const [i, c] of commits.entries()) {
    const commit = await api('POST', `/repos/${REPO}/git/commits`, {
      message: c.message,
      tree: trees[i].sha,
      parents: [i ? shas[i - 1] : start],
    });
    shas.push(commit.sha);
  }
  return shas;
};

const writeRef = (api, branch, sha, existed) =>
  existed
    ? api('PATCH', `/repos/${REPO}/git/refs/heads/${branch}`, {
        sha,
        force: false,
      })
    : api('POST', `/repos/${REPO}/git/refs`, {
        ref: `refs/heads/${branch}`,
        sha,
      });

// ----------------------------------------------------------------- a send

const printNotes = (log, planned) => {
  planned.already.forEach((s) => log(`already there: ${s}`));
  planned.byHand.forEach((s) => log(`by hand: ${s}`));
};

// One send. Throws when something fatal stops it, and the branch has not
// moved unless the message says so. Otherwise prints the outcome and
// resolves to the exit code: 0 when every change landed or was there
// already, 2 when something is left for a person.
const run = async (
  input,
  { api, gh, dryRun = false, log = (line) => process.stdout.write(`${line}\n`) }
) => {
  const problems = validate(input);
  if (problems.length) throw new Error(problems.join('\n'));
  const { base, branch } = input;
  const reviewer = input.reviewer || null;

  // Where the commits go: a later send onto its review's head; a first send
  // onto the base, or onto the branch when an earlier run made it.
  let pr = null;
  let start;
  let existed = true;
  if (input.pr) {
    pr = await api('GET', `/repos/${REPO}/pulls/${input.pr}`);
    if (pr.state !== 'open') {
      const state = pr.merged_at ? 'merged' : 'closed';
      throw new Error(`review #${pr.number} is ${state}, not open`);
    }
    if (pr.head.ref !== branch || pr.head.repo?.full_name !== REPO) {
      throw new Error(
        `review #${pr.number} is on ${pr.head.label}, not ${branch}`
      );
    }
    start = pr.head.sha;
  } else {
    start = await getRef(api, branch);
    if (start) {
      const head = encodeURIComponent(`${OWNER}:${branch}`);
      const open = await api(
        'GET',
        `/repos/${REPO}/pulls?head=${head}&state=open`
      );
      pr = open[0] || null;
    } else {
      existed = false;
      start = await getRef(api, base);
      if (!start) throw new Error(`${REPO} has no branch ${base}`);
    }
  }
  const reviewBase = pr ? pr.base.ref : base;

  // Every commit is made first and the branch moves once, at the end. If it
  // moved meanwhile, the send is built once more on its new head.
  let planned;
  let shas = [];
  for (let attempt = 1; ; attempt++) {
    planned = await plan(api, input, start, existed ? reviewBase : null);
    if (dryRun || !planned.commits.length) break;
    shas = await push(api, start, planned.commits);
    try {
      await writeRef(api, branch, shas[shas.length - 1], existed);
      break;
    } catch (e) {
      const moved =
        e.status === 422 && attempt === 1 && (await getRef(api, branch));
      if (!moved) {
        throw new Error(`nothing sent: ${branch} did not move (${e.message})`);
      }
      start = moved;
      existed = true;
    }
  }

  const ours = planned.commits.map((c, i) => ({
    subject: c.subject,
    setup: c.setup,
    sha: shas[i],
  }));
  const all = [...planned.earlier, ...ours];
  const setup = all.find((c) => c.setup);
  const body = (pr && pr.body) || '';
  // A description without "## Review" was never written: the run that
  // opened the review stopped before it, or a person opened it.
  const described = /^##\s+Review\s*$/m.test(body);
  const entries = all.filter(
    (c) =>
      !c.setup && !(described && c.sha && body.includes(`(${short(c.sha)})`))
  );
  const open = !pr && entries.length > 0;
  const hasEpic = !!pr && (pr.labels || []).some((l) => l.name === 'epic');
  const label = entries.length > 0 && (open || (!described && !hasEpic));
  const ask = !!reviewer && (entries.length > 0 || !!(pr && pr.draft));
  const ready = ask && !!(pr && pr.draft);

  if (dryRun) {
    log(
      existed
        ? `would: add to ${branch} at ${short(start)}${
            pr ? ` (review #${pr.number})` : ''
          }`
        : `would: branch ${branch} from ${base} at ${short(start)}`
    );
    planned.commits.forEach((c) => log(`would: commit ${c.subject}`));
    if (open) {
      const title = titleOf(entries);
      const state = reviewer ? 'ready' : 'draft';
      log(`would: open review "${title}" into ${base}, ${state}, label epic`);
    } else if (!pr) {
      log('would: open no review (no change to commit)');
    } else if (entries.length) {
      log(`would: list ${entries.length} more in review #${pr.number}`);
      if (label) log(`would: label review #${pr.number} epic`);
    }
    if (ready) log(`would: mark review #${pr.number} ready`);
    if (ask) log(`would: ask ${reviewer} to review`);
    else if (open) log('would: ask nobody (draft)');
    printNotes(log, planned);
    return planned.byHand.length || (!pr && !open) ? 2 : 0;
  }

  if (!pr && !open) {
    log('nothing sent: no change to commit, so no review opened');
    printNotes(log, planned);
    return 2;
  }
  if (pr && !entries.length && !ask) {
    log(`review: ${reviewUrl(pr.number)}`);
    log(`preview: ${previewUrl(pr.number)}`);
    log('nothing new: the review already has every change that applies');
    printNotes(log, planned);
    return planned.byHand.length ? 2 : 0;
  }

  // What GitHub refuses past this point is for a person, except the
  // description, which goes last: until it lists the commits, the same
  // command run again finishes the steps before it.
  const soft = async (what, act) => {
    try {
      await act();
      return true;
    } catch (e) {
      const why = e.detail || String(e.stderr || '').trim() || e.message;
      planned.byHand.push(`${what} (${why.replace(/\s+/g, ' ')})`);
      return false;
    }
  };
  let asked = false;
  let draft = open ? !reviewer : !!pr.draft;
  try {
    if (open) {
      pr = await api('POST', `/repos/${REPO}/pulls`, {
        title: titleOf(entries),
        head: branch,
        base,
        body: FOOTER,
        draft: !reviewer,
      });
    }
    const n = pr.number;
    if (label) {
      await soft('label the review epic', () =>
        api('POST', `/repos/${REPO}/issues/${n}/labels`, { labels: ['epic'] })
      );
    }
    if (ready) {
      const done = await soft('mark the review ready', () =>
        gh(['pr', 'ready', String(n), '--repo', REPO])
      );
      if (done) draft = false;
    }
    if (ask) {
      asked = await soft(`ask ${reviewer} to review`, () =>
        api('POST', `/repos/${REPO}/pulls/${n}/requested_reviewers`, {
          reviewers: [reviewer],
        })
      );
    }
    if (entries.length) {
      let next;
      if (described) {
        next = appendToBody(body, entries);
      } else {
        // Keep what a person wrote; drop the line the review opened with.
        const kept = body
          .split(/\r?\n/)
          .filter((l) => l.trim() !== FOOTER)
          .join('\n')
          .trim();
        const fresh = prBody(n, entries, setup && setup.sha);
        next = kept ? `${fresh}\n\n${kept}` : fresh;
      }
      await api('PATCH', `/repos/${REPO}/pulls/${n}`, { body: next });
    }
  } catch (e) {
    const where = shas.length ? `the commits are on ${branch}; ` : '';
    throw new Error(
      `${e.message}\n${where}run the same command again to finish the review`
    );
  }

  log(`review: ${reviewUrl(pr.number)}`);
  log(`preview: ${previewUrl(pr.number)}`);
  log(
    asked
      ? `reviewer: ${reviewer} asked`
      : `reviewer: nobody asked${draft ? ', draft' : ''}`
  );
  ours.forEach((c) => log(`sent: ${short(c.sha)} ${c.subject}`));
  printNotes(log, planned);
  return planned.byHand.length ? 2 : 0;
};

// ------------------------------------------------------------ the command

const ghCli = (args) =>
  execFileSync('gh', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

// GitHub's REST API as the person's gh login. A refusal throws with the
// status and GitHub's own words.
const githubApi = (token) => async (method, path, body) => {
  let res;
  try {
    res = await fetch(`https://api.github.com${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token()}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'gv-design-workbench-send',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
  } catch (e) {
    const why = (e.cause && e.cause.message) || e.message;
    throw new Error(`GitHub ${method} ${path}: ${why}`);
  }
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (res.ok) return data;
  const errors = ((data && data.errors) || []).map((e) =>
    isText(e) ? e : e.message || e.code
  );
  const detail =
    [data && data.message, ...errors].filter(Boolean).join('; ') ||
    res.statusText;
  const error = new Error(`GitHub ${method} ${path}: ${res.status} ${detail}`);
  error.status = res.status;
  error.detail = detail;
  throw error;
};

const main = async (argv) => {
  const unknown = argv.find((a) => a !== '--dry-run');
  if (unknown) {
    throw new Error(`unknown argument ${unknown}: the one flag is --dry-run`);
  }
  let input;
  try {
    input = JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch (e) {
    throw new Error(`stdin is not the workbench's JSON (${e.message})`);
  }
  // Asked for at the first call, so a bad input fails before gh runs.
  let token = '';
  const getToken = () => {
    if (!token) {
      try {
        token = ghCli(['auth', 'token']).trim();
      } catch {
        token = '';
      }
      if (!token) throw new Error('no GitHub login: run `gh auth login`');
    }
    return token;
  };
  const api = githubApi(getToken);
  const dryRun = argv.includes('--dry-run');
  // A dry run cannot write, whatever run() asks for.
  const refuse = (what) => {
    throw new Error(`dry run: ${what} refused`);
  };
  return run(input, {
    api: dryRun
      ? async (method, path, body) =>
          method === 'GET' ? api(method, path, body) : refuse(method)
      : api,
    gh: dryRun ? () => refuse('gh') : ghCli,
    dryRun,
  });
};

if (require.main === module) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (e) => {
      process.stderr.write(`${e.message}\n`);
      process.exitCode = 1;
    }
  );
}

module.exports = {
  APP_FILE,
  SETUP_SUBJECT,
  TENANT_FILE,
  TENANT_TOKENS,
  appendToBody,
  applyLineEdit,
  githubApi,
  prBody,
  run,
  setupApp,
  validate,
};
