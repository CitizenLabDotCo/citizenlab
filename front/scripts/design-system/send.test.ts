import { createHash } from 'crypto';

import {
  appendToBody,
  applyLineEdit,
  prBody,
  isTokenSwap,
  run,
  setupApp,
  SETUP_SUBJECT,
  TENANT_TOKENS,
  validate,
} from './send';

const REPO = 'CitizenLabDotCo/citizenlab';
const R = `/repos/${REPO}`;
const BASE = 'design-system/workbench';
const BRANCH = 'design-system/button-k3f9';
const APP = 'front/app/containers/App/index.tsx';
const TENANT = 'front/app/containers/App/TenantTokens.tsx';
const BUTTON = 'front/app/component-library/components/Button/index.tsx';
const BASE_SHA = 'ba5e'.padEnd(40, '0');
const HEAD_SHA = 'bead'.padEnd(40, '0');

// App/index.tsx around the setup's anchors.
const APP_TEXT = `import React, { lazy, Suspense, useEffect, useState } from 'react';

import * as Sentry from '@sentry/react';
import GlobalStyle from 'global-styles';
import 'intersection-observer';

import messages from './messages';
import CommunityMonitorModalManager from './ModalQueue/modals/CommunityMonitor/ModalManager';
import UserSessionRecordingModalManager from './ModalQueue/modals/UserSessionRecording/ModalManager';

const UserDeletedModal = lazy(() => import('./UserDeletedModal'));

const App = () => (
      <ThemeProvider theme={theme}>
        <ModalQueueProvider>
          <GlobalStyle />
          <Box />
        </ModalQueueProvider>
      </ThemeProvider>
);
`;

const APP_SET_UP = `import React, { lazy, Suspense, useEffect, useState } from 'react';

import * as Sentry from '@sentry/react';
import GlobalStyle from 'global-styles';
import 'design-system/tokens/tokens.css';
import 'intersection-observer';

import messages from './messages';
import CommunityMonitorModalManager from './ModalQueue/modals/CommunityMonitor/ModalManager';
import UserSessionRecordingModalManager from './ModalQueue/modals/UserSessionRecording/ModalManager';
import TenantTokens from './TenantTokens';

const UserDeletedModal = lazy(() => import('./UserDeletedModal'));

const App = () => (
      <ThemeProvider theme={theme}>
        <ModalQueueProvider>
          <GlobalStyle />
          <TenantTokens />
          <Box />
        </ModalQueueProvider>
      </ThemeProvider>
);
`;

const BUTTON_TEXT = `const borderRadius =
  props.borderRadius ||
    props.theme.borderRadius;
export default Button;
`;

const change = {
  subject:
    'design-system(design): Button radius 3px → --gv-radius-1 [AI-assisted]',
  story: 'components-actions-button--default',
  file: BUTTON,
  line: 3,
  old: '    props.theme.borderRadius;',
  new: "    'var(--gv-radius-1)';",
};
const BUTTON_DONE = BUTTON_TEXT.replace(change.old, change.new);

const input = {
  repo: REPO,
  base: BASE,
  branch: BRANCH,
  reviewer: null as string | null,
  changes: [change],
};

const review = (n: number) => [
  `review: https://github.com/${REPO}/pull/${n}`,
  `preview: https://pr-${n}.epic.hq.govocal.com/storybook/workbench/#/review`,
];

type Call = { method: string; path: string; body?: any; answer?: any };

const fail = (status: number, message: string) =>
  Object.assign(new Error(message), { status });

const commitOf = (subject: string, sha: string) => ({
  sha,
  parents: [{ sha: 'p' }],
  commit: { message: `${subject}\n\nmore` },
});

// A GitHub in memory that records every call. The objects it makes get
// shas in order (b000001…, t000002…, c000003…).
const fakeGitHub = ({
  refs = {},
  files = {},
  pulls = [],
  compare = [],
  refusals = 0,
}: {
  refs?: Record<string, string>;
  files?: Record<string, string>;
  pulls?: any[];
  compare?: any[];
  refusals?: number;
}) => {
  const calls: Call[] = [];
  let made = 0;
  let refused = 0;
  const sha = (kind: string) =>
    `${kind}${String(++made).padStart(6, '0')}`.padEnd(40, 'f');
  const routes: [string, RegExp, (m: RegExpExecArray, body: any) => any][] = [
    [
      'GET',
      /^\/git\/ref\/heads\/(.+)$/,
      (m) => {
        if (!refs[m[1]]) throw fail(404, 'Not Found');
        return { object: { sha: refs[m[1]] } };
      },
    ],
    [
      'GET',
      /^\/contents\/(.+)\?ref=/,
      (m) => {
        const path = decodeURIComponent(m[1]);
        if (!(path in files)) throw fail(404, 'Not Found');
        const content = Buffer.from(files[path]).toString('base64');
        return { type: 'file', encoding: 'base64', sha: 'blob', content };
      },
    ],
    [
      'GET',
      /^\/pulls\/(\d+)$/,
      (m) => pulls.find((p) => p.number === Number(m[1])),
    ],
    ['GET', /^\/pulls\?/, () => pulls.filter((p) => p.state === 'open')],
    ['GET', /^\/compare\//, () => ({ commits: compare })],
    [
      'GET',
      /^\/git\/commits\/(.+)$/,
      (m) => ({ sha: m[1], tree: { sha: `tree-of-${m[1]}` } }),
    ],
    ['POST', /^\/git\/blobs$/, () => ({ sha: sha('b') })],
    ['POST', /^\/git\/trees$/, () => ({ sha: sha('t') })],
    ['POST', /^\/git\/commits$/, () => ({ sha: sha('c') })],
    [
      'POST',
      /^\/git\/refs$/,
      (_, body) => {
        refs[body.ref.replace('refs/heads/', '')] = body.sha;
        return {};
      },
    ],
    [
      'PATCH',
      /^\/git\/refs\/heads\/(.+)$/,
      (m, body) => {
        if (refused < refusals) {
          refused++;
          refs[m[1]] = `moved${refused}`.padEnd(40, '0');
          throw fail(422, 'Update is not a fast forward');
        }
        refs[m[1]] = body.sha;
        return {};
      },
    ],
    [
      'POST',
      /^\/pulls$/,
      (_, body) => ({ number: 15100, state: 'open', labels: [], ...body }),
    ],
    ['POST', /^\/issues\/\d+\/labels$/, () => []],
    ['POST', /^\/pulls\/\d+\/requested_reviewers$/, () => ({})],
    ['PATCH', /^\/pulls\/\d+$/, () => ({})],
  ];
  const api = async (method: string, path: string, body?: any) => {
    const call: Call = { method, path, body };
    calls.push(call);
    for (const [verb, pattern, answer] of routes) {
      const m = verb === method ? pattern.exec(path.slice(R.length)) : null;
      if (m) {
        call.answer = answer(m, body);
        return call.answer;
      }
    }
    throw new Error(`unexpected ${method} ${path}`);
  };
  const writes = () => calls.filter((c) => c.method !== 'GET');
  const to = (path: string) => writes().filter((c) => c.path === `${R}${path}`);
  return { api, calls, writes, to };
};

const send = async (
  gitHub: ReturnType<typeof fakeGitHub>,
  sent: any,
  dryRun = false
) => {
  const lines: string[] = [];
  const gh = jest.fn();
  const code = await run(sent, {
    api: gitHub.api,
    gh,
    dryRun,
    log: (line: string) => lines.push(line),
  });
  return { code, lines, gh };
};

const openPull = (body: string, draft: boolean) => ({
  number: 15069,
  state: 'open',
  draft,
  merged_at: null,
  head: {
    ref: BRANCH,
    sha: HEAD_SHA,
    label: `CitizenLabDotCo:${BRANCH}`,
    repo: { full_name: REPO },
  },
  base: { ref: BASE },
  labels: [{ name: 'epic' }],
  body,
});

describe('validate', () => {
  const good = { ...input, pr: 15069, reviewer: 'IvaKop' };

  it('passes a good send, first or later, with or without a reviewer', () => {
    expect(validate(good)).toEqual([]);
    expect(validate(input)).toEqual([]);
    expect(
      validate({ ...good, changes: [{ ...change, body: 'Why.', story: null }] })
    ).toEqual([]);
  });

  it.each([
    ['repo', { repo: 'someone/citizenlab' }],
    ['base', { base: 'main' }],
    ['branch', { branch: 'feature/button' }],
    ['branch', { branch: 'design-system/Button' }],
    ['branch', { branch: BASE }],
    ['pr', { pr: 0 }],
    ['pr', { pr: '15069' }],
    ['reviewer', { reviewer: 'iva kop' }],
    ['reviewer', { reviewer: 'x'.repeat(40) }],
    ['changes', { changes: [] }],
  ])('refuses a bad %s', (field, patch) => {
    const problems = validate({ ...good, ...patch });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(new RegExp(`^${field} `));
  });

  it.each([
    ['subject', { subject: '' }],
    ['subject', { subject: 'one\ntwo' }],
    ['story', { story: 'Button Default' }],
    ['file', { file: 'back/app/models/user.rb' }],
    ['file', { file: 'front/app/../../.github/workflows/ci.yml' }],
    ['line', { line: 0 }],
    ['line', { line: 3.5 }],
    ['line', { line: '344' }],
    ['old', { old: 'two\nlines' }],
    ['new', { new: 'a\r' }],
    ['old', { new: change.old }],
  ])('refuses a change with a bad %s', (field, patch) => {
    expect(
      validate({ ...good, changes: [change, { ...change, ...patch }] })
    ).toEqual([expect.stringMatching(new RegExp(`^change 2: ${field} `))]);
  });

  it('refuses what is not an object', () => {
    expect(validate(null)).toEqual(['the input must be a JSON object']);
    expect(validate([input])).toEqual(['the input must be a JSON object']);
  });
});

describe('applyLineEdit', () => {
  const text = 'a\n  b;\nc\n';
  const edit = { line: 2, old: '  b;', new: '  B;' };

  it('swaps the line at its number', () => {
    expect(applyLineEdit(text, edit)).toEqual({
      text: 'a\n  B;\nc\n',
      status: 'changed',
    });
  });

  it('finds a line that drifted when it is there once', () => {
    expect(applyLineEdit(`x\ny\n${text}`, edit)).toEqual({
      text: 'x\ny\na\n  B;\nc\n',
      status: 'changed',
    });
  });

  it('reads a change already made as already there, at its line or not', () => {
    const done = 'a\n  B;\nc\n';
    expect(applyLineEdit(done, edit)).toEqual({
      text: done,
      status: 'already',
    });
    expect(applyLineEdit(`x\n${done}`, edit).status).toBe('already');
  });

  it('leaves a line that is ambiguous or gone for a person', () => {
    expect(applyLineEdit('  b;\nx\n  b;\n', edit).status).toBe('moved');
    expect(applyLineEdit('a\nc\n', edit).status).toBe('moved');
    // `old` still there twice: not already done, whatever `new` says.
    expect(applyLineEdit('  B;\nx\n  b;\n  b;\n', edit).status).toBe('moved');
  });

  it('keeps the trailing newline, or its absence', () => {
    expect(applyLineEdit('a\n  b;', edit).text).toBe('a\n  B;');
    expect(applyLineEdit('a\n  b;\n\n', edit).text).toBe('a\n  B;\n\n');
  });
});

describe('setupApp', () => {
  it('puts each line after its anchor', () => {
    expect(setupApp(APP_TEXT)).toBe(APP_SET_UP);
  });

  it('gives null when an anchor moved or is there twice', () => {
    expect(
      setupApp(APP_TEXT.replace('          <GlobalStyle />', '<GlobalStyle />'))
    ).toBeNull();
    expect(
      setupApp(APP_TEXT.replace("import GlobalStyle from 'global-styles';", ''))
    ).toBeNull();
    expect(
      setupApp(
        APP_TEXT.replace(
          '          <Box />',
          '          <GlobalStyle />\n          <Box />'
        )
      )
    ).toBeNull();
  });

  it('gives null for an app half set up', () => {
    expect(
      setupApp(
        APP_TEXT.replace(
          "import 'intersection-observer';",
          "import TenantTokens from './TenantTokens';"
        )
      )
    ).toBeNull();
  });

  it('adds TenantTokens.tsx as agreed, ending in one newline', () => {
    expect(TENANT_TOKENS).toMatch(/^import \{ useEffect \} from 'react';\n\n/);
    expect(TENANT_TOKENS).toMatch(/\};\n\nexport default TenantTokens;\n$/);
    // The agreed bytes: a change to the file changes this on purpose.
    expect(createHash('sha256').update(TENANT_TOKENS).digest('hex')).toBe(
      '24b298b9334951ab2900ca5344de1656dc49f5985e9ee7ce6e9dd85f8ffc6439'
    );
  });
});

describe('the description', () => {
  const entries = [
    { subject: 'One', sha: 'aaaaaaa111' },
    { subject: 'Two', sha: 'bbbbbbb222' },
  ];

  it('links the preview, lists the changes and names the setup commit', () => {
    expect(prBody(15100, entries, 'ccccccc333')).toBe(
      [
        '## Review',
        '',
        'https://pr-15100.epic.hq.govocal.com/storybook/workbench/#/review',
        '',
        '1. One (aaaaaaa)',
        '2. Two (bbbbbbb)',
        '',
        'Sent from the design workbench (Send for review). The setup commit ccccccc makes the app load the tokens.',
      ].join('\n')
    );
    expect(prBody(15100, entries)).toMatch(
      /\(bbbbbbb\)\n\nSent from the design workbench \(Send for review\)\.$/
    );
  });

  it('numbers new entries on and keeps what a person wrote', () => {
    const edited = `${prBody(15100, entries)}\r\n\r\nNotes:\r\n1. Not ours`;
    expect(
      appendToBody(edited, [{ subject: 'Three', sha: 'ddddddd444' }])
    ).toBe(
      [
        '## Review',
        '',
        'https://pr-15100.epic.hq.govocal.com/storybook/workbench/#/review',
        '',
        '1. One (aaaaaaa)',
        '2. Two (bbbbbbb)',
        '3. Three (ddddddd)',
        '',
        'Sent from the design workbench (Send for review).',
        '',
        'Notes:',
        '1. Not ours',
      ].join('\n')
    );
  });

  it('starts a list in a description without one', () => {
    expect(appendToBody('Hello.', [entries[0]])).toBe(
      'Hello.\n\n1. One (aaaaaaa)'
    );
  });
});

describe('run', () => {
  it('first send: the setup and the change, ONE ref write after the commits, a draft labelled epic', async () => {
    const gitHub = fakeGitHub({
      refs: { [BASE]: BASE_SHA },
      files: { [APP]: APP_TEXT, [BUTTON]: BUTTON_TEXT },
    });
    const { code, lines, gh } = await send(gitHub, input);
    expect(code).toBe(0);

    const writes = gitHub.writes();
    const commits = gitHub.to('/git/commits');
    const [setup, edit] = commits.map((c) => c.answer.sha);
    const [setupMessage, editMessage] = commits.map((c) => c.body.message);
    expect(
      setupMessage.startsWith(
        `${SETUP_SUBJECT}\n\napp/containers/App/index.tsx imports design-system/tokens/tokens.css, so\nvar(--gv-*)`
      )
    ).toBe(true);
    expect(setupMessage.endsWith('\ncomponent reads one.')).toBe(true);
    expect(editMessage).toBe(`${change.subject}\n\nStory: ${change.story}`);
    expect(commits.map((c) => c.body.parents)).toEqual([[BASE_SHA], [setup]]);

    const blobs = gitHub.to('/git/blobs').map((c) => c.body);
    expect(blobs).toEqual([
      { content: TENANT_TOKENS, encoding: 'utf-8' },
      { content: APP_SET_UP, encoding: 'utf-8' },
      { content: BUTTON_DONE, encoding: 'utf-8' },
    ]);
    const trees = gitHub.to('/git/trees').map((c) => c.body);
    expect(trees.map((t) => t.base_tree)).toEqual([
      `tree-of-${BASE_SHA}`,
      `tree-of-${BASE_SHA}`,
    ]);
    // The change's tree holds the setup too: each tree is the base plus
    // every file changed so far.
    expect(trees.map((t) => t.tree.map((e: any) => e.path))).toEqual([
      [TENANT, APP],
      [TENANT, APP, BUTTON],
    ]);

    const refWrites = writes.filter((c) => c.path.includes('/git/refs'));
    expect(refWrites).toEqual([
      expect.objectContaining({
        method: 'POST',
        path: `${R}/git/refs`,
        body: { ref: `refs/heads/${BRANCH}`, sha: edit },
      }),
    ]);
    const refAt = writes.indexOf(refWrites[0]);
    expect(writes.slice(0, refAt).every((c) => c.path.includes('/git/'))).toBe(
      true
    );
    expect(writes.slice(refAt + 1).some((c) => c.path.includes('/git/'))).toBe(
      false
    );

    expect(gitHub.to('/pulls')[0].body).toEqual({
      title: change.subject,
      head: BRANCH,
      base: BASE,
      body: 'Sent from the design workbench (Send for review).',
      draft: true,
    });
    expect(gitHub.to('/issues/15100/labels')[0].body).toEqual({
      labels: ['epic'],
    });
    expect(gitHub.to('/pulls/15100/requested_reviewers')).toEqual([]);
    expect(gh).not.toHaveBeenCalled();
    expect(writes[writes.length - 1]).toMatchObject({
      method: 'PATCH',
      path: `${R}/pulls/15100`,
      body: {
        body: prBody(15100, [{ subject: change.subject, sha: edit }], setup),
      },
    });

    expect(lines).toEqual([
      ...review(15100),
      'reviewer: nobody asked, draft',
      `sent: ${setup.slice(0, 7)} ${SETUP_SUBJECT}`,
      `sent: ${edit.slice(0, 7)} ${change.subject}`,
    ]);
  });

  it('later send: one fast-forward, the draft made ready, the reviewer asked again, the list grows', async () => {
    const earlier = {
      subject: 'design-system(design): Card gap',
      sha: 'e'.repeat(40),
    };
    const gitHub = fakeGitHub({
      refs: { [BASE]: BASE_SHA, [BRANCH]: HEAD_SHA },
      files: { [APP]: APP_SET_UP, [BUTTON]: BUTTON_TEXT },
      pulls: [openPull(prBody(15069, [earlier]), true)],
      compare: [commitOf(earlier.subject, earlier.sha)],
    });
    const { code, lines, gh } = await send(gitHub, {
      ...input,
      pr: 15069,
      reviewer: 'IvaKop',
    });
    expect(code).toBe(0);

    const writes = gitHub.writes();
    // The app is set up already: no setup commit, no TenantTokens.tsx.
    const commits = gitHub.to('/git/commits');
    expect(commits).toHaveLength(1);
    expect(commits[0].body.parents).toEqual([HEAD_SHA]);
    expect(gitHub.to('/git/blobs').map((c) => c.body.content)).toEqual([
      BUTTON_DONE,
    ]);
    const edit = commits[0].answer.sha;
    expect(writes.filter((c) => c.path.includes('/git/refs'))).toEqual([
      expect.objectContaining({
        method: 'PATCH',
        path: `${R}/git/refs/heads/${BRANCH}`,
        body: { sha: edit, force: false },
      }),
    ]);
    expect(gitHub.to('/pulls')).toEqual([]);
    expect(gitHub.to('/issues/15069/labels')).toEqual([]);
    expect(gh).toHaveBeenCalledWith(['pr', 'ready', '15069', '--repo', REPO]);
    expect(gitHub.to('/pulls/15069/requested_reviewers')[0].body).toEqual({
      reviewers: ['IvaKop'],
    });
    expect(writes[writes.length - 1].body.body).toBe(
      prBody(15069, [earlier, { subject: change.subject, sha: edit }])
    );
    expect(lines).toEqual([
      ...review(15069),
      'reviewer: IvaKop asked',
      `sent: ${edit.slice(0, 7)} ${change.subject}`,
    ]);
  });

  it('a change that does not apply is by hand: exit 2, the review opens with the rest', async () => {
    const moved = {
      ...change,
      subject: 'design-system(design): Button gap [AI-assisted]',
      line: 1,
      old: '  gap: 3px;',
      new: '  gap: var(--gv-space-1);',
    };
    const gitHub = fakeGitHub({
      refs: { [BASE]: BASE_SHA },
      files: { [APP]: APP_SET_UP, [BUTTON]: BUTTON_TEXT },
    });
    const { code, lines } = await send(gitHub, {
      ...input,
      reviewer: 'IvaKop',
      changes: [moved, change],
    });
    expect(code).toBe(2);
    expect(gitHub.to('/pulls')[0].body).toMatchObject({
      title: change.subject,
      draft: false,
    });
    expect(gitHub.to('/pulls/15100/requested_reviewers')).toHaveLength(1);
    expect(lines).toContain('reviewer: IvaKop asked');
    expect(lines[lines.length - 1]).toBe(
      `by hand: ${moved.subject} (the line moved)`
    );
  });

  it('nothing to commit: no review, nothing written, exit 2', async () => {
    const gitHub = fakeGitHub({
      refs: { [BASE]: BASE_SHA },
      files: { [APP]: APP_TEXT, [BUTTON]: BUTTON_DONE },
    });
    const { code, lines } = await send(gitHub, input);
    expect(code).toBe(2);
    expect(gitHub.writes()).toEqual([]);
    expect(lines).toEqual([
      'nothing sent: no change to commit, so no review opened',
      `already there: ${change.subject}`,
    ]);
  });

  it('the setup is by hand when its anchors moved; the change still goes', async () => {
    const gitHub = fakeGitHub({
      refs: { [BASE]: BASE_SHA },
      files: {
        [APP]: APP_TEXT.replace('          <GlobalStyle />\n', ''),
        [BUTTON]: BUTTON_TEXT,
      },
    });
    const { code, lines } = await send(gitHub, input);
    expect(code).toBe(2);
    expect(gitHub.to('/git/commits').map((c) => c.body.message)).toEqual([
      `${change.subject}\n\nStory: ${change.story}`,
    ]);
    expect(lines[lines.length - 1]).toBe(
      'by hand: the app setup (anchors moved)'
    );
  });

  it('a dry run does the reads, prints the plan and writes nothing', async () => {
    const gitHub = fakeGitHub({
      refs: { [BASE]: BASE_SHA },
      files: { [APP]: APP_TEXT, [BUTTON]: BUTTON_TEXT },
    });
    const { code, lines, gh } = await send(
      gitHub,
      { ...input, reviewer: 'IvaKop' },
      true
    );
    expect(code).toBe(0);
    expect(gitHub.writes()).toEqual([]);
    expect(gh).not.toHaveBeenCalled();
    expect(lines).toEqual([
      `would: branch ${BRANCH} from ${BASE} at ba5e000`,
      `would: commit ${SETUP_SUBJECT}`,
      `would: commit ${change.subject}`,
      `would: open review "${change.subject}" into ${BASE}, ready, label epic`,
      'would: ask IvaKop to review',
    ]);
  });

  it('a branch that moved meanwhile: built once more on its new head; moved twice: nothing sent', async () => {
    const setUp = () =>
      fakeGitHub({
        refs: { [BASE]: BASE_SHA, [BRANCH]: HEAD_SHA },
        files: { [APP]: APP_SET_UP, [BUTTON]: BUTTON_TEXT },
        pulls: [openPull(prBody(15069, []), false)],
        refusals: 1,
      });
    const once = setUp();
    expect((await send(once, { ...input, pr: 15069 })).code).toBe(0);
    const commits = once.to('/git/commits');
    expect(commits.map((c) => c.body.parents)).toEqual([
      [HEAD_SHA],
      ['moved1'.padEnd(40, '0')],
    ]);
    const refWrites = once.to(`/git/refs/heads/${BRANCH}`);
    expect(refWrites.map((c) => c.body.sha)).toEqual(
      commits.map((c) => c.answer.sha)
    );

    const twice = fakeGitHub({
      refs: { [BASE]: BASE_SHA, [BRANCH]: HEAD_SHA },
      files: { [APP]: APP_SET_UP, [BUTTON]: BUTTON_TEXT },
      pulls: [openPull(prBody(15069, []), false)],
      refusals: 2,
    });
    await expect(send(twice, { ...input, pr: 15069 })).rejects.toThrow(
      /^nothing sent: design-system\/button-k3f9 did not move/
    );
    expect(twice.writes().some((c) => c.path.includes('/pulls/'))).toBe(false);
  });

  it('a retry after a run that stopped past its push opens the review with what that run left', async () => {
    const setup = 'a'.repeat(40);
    const edit = 'b'.repeat(40);
    const gitHub = fakeGitHub({
      refs: { [BASE]: BASE_SHA, [BRANCH]: edit },
      files: { [APP]: APP_SET_UP, [BUTTON]: BUTTON_DONE },
      compare: [commitOf(SETUP_SUBJECT, setup), commitOf(change.subject, edit)],
    });
    const { code, lines } = await send(gitHub, input);
    expect(code).toBe(0);
    expect(gitHub.writes().some((c) => c.path.includes('/git/'))).toBe(false);
    expect(gitHub.to('/pulls')[0].body).toMatchObject({
      title: change.subject,
      draft: true,
    });
    expect(gitHub.to('/pulls/15100')[0].body.body).toBe(
      prBody(15100, [{ subject: change.subject, sha: edit }], setup)
    );
    expect(lines).toEqual([
      ...review(15100),
      'reviewer: nobody asked, draft',
      `already there: ${change.subject}`,
    ]);
  });

  it('refuses a later send to a review that is not open on its branch', async () => {
    const closed = { ...openPull('', false), state: 'closed' };
    await expect(
      send(fakeGitHub({ pulls: [closed] }), { ...input, pr: 15069 })
    ).rejects.toThrow('review #15069 is closed, not open');
    const pull = openPull('', false);
    const other = {
      ...pull,
      head: {
        ...pull.head,
        ref: 'design-system/other-1234',
        label: 'CitizenLabDotCo:design-system/other-1234',
      },
    };
    await expect(
      send(fakeGitHub({ pulls: [other] }), { ...input, pr: 15069 })
    ).rejects.toThrow(
      'review #15069 is on CitizenLabDotCo:design-system/other-1234, not design-system/button-k3f9'
    );
  });
});

describe('isTokenSwap', () => {
  it.each([
    ['    props.theme.borderRadius;', "    'var(--gv-radius-control)';"],
    ["        return '9px 18px';", "        return 'var(--gv-space-2) 18px';"],
    [
      '        return `${fontSizes.base}px`;',
      "        return 'var(--gv-fs-base)';",
    ],
    [
      '  borderRadius: bo.borderRadius,',
      "  borderRadius: 'var(--gv-radius-2)',",
    ],
    ['  border-radius: 3px;', '  border-radius: var(--gv-radius-1);'],
  ])('lets a token in: %s', (before, after) => {
    expect(isTokenSwap(before, after)).toBe(true);
    // The reverse is a put-back.
    expect(isTokenSwap(after, before)).toBe(true);
  });

  it.each([
    ['a token that is not ours', '  r: 3px;', '  r: var(--other);'],
    [
      'two spans',
      "  a: '3px', b: '4px',",
      "  a: 'var(--gv-x)', b: 'var(--gv-y)',",
    ],
    ['code around the token', '  r: x;', '  r: var(--gv-x); run();'],
    ['a value swap', "  r: '3px',", "  r: '4px',"],
    ['eating code', '  r: a; b();', "  r: 'var(--gv-x)';"],
    ['eating a comment', '  r: a, // keep', "  r: 'var(--gv-x)',"],
    ['the same line', '  r: x;', '  r: x;'],
    ['not text', '  r: x;', undefined],
  ])('refuses %s', (_, before, after) => {
    expect(isTokenSwap(before, after as string)).toBe(false);
  });
});
