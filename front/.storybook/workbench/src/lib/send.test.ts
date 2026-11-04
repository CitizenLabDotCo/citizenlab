import {
  branchFor,
  currentOf,
  EMPTY,
  freshKeys,
  GhPull,
  Item,
  LineEdit,
  lineEditOfUndo,
  nameOf,
  REVIEWERS,
  SendRecord,
  sendText,
  terminalCommand,
  since,
  statusOf,
  statusText,
  undoOfEdit,
  undoOfLineEdit,
  undoOfToken,
  unsentCount,
  withCopy,
  withPull,
} from './send';

const item = (key: string, value: string): Item => ({
  key,
  value,
  task: `change: ${key}`,
  undo: `put back: ${key}`,
});

const pull = (over: Partial<GhPull> = {}): GhPull => ({
  number: 15071,
  state: 'open',
  merged_at: null,
  head: { sha: 'aaa' },
  requested_reviewers: [],
  ...over,
});

describe('what has not been sent', () => {
  const current = currentOf(
    [
      { id: 'btn|0|fill', to: { value: '#E52516', token: '--gv-error' } },
      { id: 'btn|0|radius', to: { value: '4px' } },
    ],
    { '--gv-radius-1': '3px', '--gv-space-2': undefined }
  );

  it('keys edits by id and tokens by name, with their values', () => {
    expect(current).toEqual({
      'btn|0|fill': '--gv-error',
      'btn|0|radius': '4px',
      'token:--gv-radius-1': '3px',
    });
  });

  it('finds new, changed and reset changes', () => {
    const base = {
      'btn|0|fill': { value: '--gv-error', undo: 'u1' },
      'btn|0|radius': { value: '2px', undo: 'u2' },
      'btn|1|fill': { value: '--gv-grey-100', undo: 'u3' },
    };
    expect(since(current, base)).toEqual({
      changed: ['btn|0|radius', 'token:--gv-radius-1'],
      gone: ['btn|1|fill'],
    });
  });

  it('counts against the last copy, else what was confirmed', () => {
    const sent = { 'btn|0|fill': { value: '--gv-error', undo: '' } };
    expect(unsentCount(current, EMPTY)).toBe(3);
    expect(unsentCount(current, { sent })).toBe(2);
    expect(
      unsentCount(current, {
        sent,
        pending: {
          sent: {
            ...sent,
            'btn|0|radius': { value: '4px', undo: '' },
            'token:--gv-radius-1': { value: '3px', undo: '' },
          },
        },
      })
    ).toBe(0);
  });

  it('counts nothing to put back once the review closed without merging', () => {
    const sent = { 'btn|0|fill': { value: '--gv-error', undo: 'put back' } };
    const closed = { state: 'closed' as const, who: [] };
    // The sent edit was reset since: a merged review needs it put back,
    // a closed one landed nothing.
    expect(unsentCount({}, { sent })).toBe(1);
    expect(unsentCount({}, { sent, status: closed })).toBe(0);
    expect(unsentCount(current, { sent, status: closed })).toBe(3);
  });
});

describe('put-back lines', () => {
  it('say where the sent value goes back to', () => {
    expect(
      undoOfEdit(
        {
          props: ['background-color'],
          from: { raw: '#044D6C' },
          to: { value: '#E52516', token: '--gv-error' },
        },
        'Button',
        'app/component-library/Button.tsx'
      )
    ).toBe(
      'put back: Button · app/component-library/Button.tsx · background-color var(--gv-error) → #044D6C'
    );
    expect(undoOfToken('--gv-radius-1', '2px')).toBe(
      'put back: tokens.source.json · --gv-radius-1 to 2px'
    );
  });
});

describe('branchFor', () => {
  it('names the first component and a tag', () => {
    expect(branchFor('Back-office buttons', 'k3f9')).toBe(
      'design-system/back-office-buttons-k3f9'
    );
    expect(branchFor('!!', 'k3f9')).toBe('design-system/review-k3f9');
    expect(
      branchFor('A very long component name that goes on and on', 'ab12')
    ).toBe('design-system/a-very-long-component-name-tha-ab12');
  });
});

describe('sendText', () => {
  const radius: LineEdit = {
    subject:
      'design-system(design): Button radius 3px \u2192 --gv-radius-1 [AI-assisted]',
    story: 'components-actions-button--default',
    file: 'front/app/component-library/components/Button/index.tsx',
    line: 344,
    old: '    props.theme.borderRadius;',
    new: "    'var(--gv-radius-1)';",
  };
  // The JSON the script is fed, between the heredoc lines.
  const inputOf = (text: string) =>
    JSON.parse(text.split("<<'EOF'\n")[1].split('\nEOF')[0]);

  it('opens a review with one command: the script fed the exact edits', () => {
    const text = sendText({
      branch: 'design-system/button-k3f9',
      reviewer: 'IvaKop',
      edits: [radius],
      tasks: [],
      gone: [],
      tokenPatch: '',
    });
    expect(text).toContain('never PR, branch or commit');
    expect(text).toContain(
      "gh api -H 'Accept: application/vnd.github.raw' 'repos/CitizenLabDotCo/citizenlab/contents/front/scripts/design-system/send.js?ref=design-system/workbench' > /tmp/gv-send.js && node /tmp/gv-send.js <<'EOF'"
    );
    expect(inputOf(text)).toEqual({
      repo: 'CitizenLabDotCo/citizenlab',
      base: 'design-system/workbench',
      branch: 'design-system/button-k3f9',
      reviewer: 'IvaKop',
      changes: [radius],
    });
    expect(text).toContain('it is with Iva for review');
    // No clone, no pictures, no waiting on the preview.
    expect(text).not.toContain('pictures in');
    expect(text).toContain('Do not wait for the preview');
    expect(text).not.toContain('By hand');
    expect(text).not.toContain('\u2014');
  });

  it('asks nobody for a test', () => {
    const text = sendText({
      branch: 'design-system/button-k3f9',
      reviewer: null,
      edits: [radius],
      tasks: [],
      gone: [],
      tokenPatch: '',
    });
    expect(inputOf(text).reviewer).toBeNull();
    expect(text).toContain('nobody is asked to look yet (a test)');
  });

  it('adds to a linked review: put-back edits to the script, the rest by hand', () => {
    const putBack = undoOfLineEdit(radius);
    const text = sendText({
      branch: 'design-system/button-k3f9',
      pr: 15071,
      reviewer: 'IvaKop',
      edits: [],
      tasks: ['change: C'],
      gone: [putBack, 'put back: A'],
      tokenPatch: '[ x ]\n',
    });
    expect(text.split('\n')[0]).toContain(
      'review #15071 (branch design-system/button-k3f9'
    );
    expect(text).toContain('read their comments on GitHub first');
    const input = inputOf(text);
    expect(input.pr).toBe(15071);
    expect(input.changes).toEqual([
      {
        ...radius,
        subject:
          'design-system(design): put back Button radius 3px \u2192 --gv-radius-1 [AI-assisted]',
        old: radius.new,
        new: radius.old,
      },
    ]);
    expect(text).toContain(
      'By hand:\n\nchange: C\n\ntokens.source.json:\n[ x ]\n\nPut back (reset in the Workbench):\n\nput back: A'
    );
    // The by-hand step comes before the person is told.
    expect(
      text.indexOf('3. Then by hand on design-system/button-k3f9')
    ).toBeGreaterThan(0);
    expect(text).toContain('\n4. Tell the person it is with Iva for review');
  });

  it('gives the command alone for a terminal only when the script does everything', () => {
    const args = {
      branch: 'design-system/button-k3f9',
      reviewer: null,
      edits: [radius],
      tasks: [],
      gone: [],
      tokenPatch: '',
    };
    const command = terminalCommand(args);
    expect(command?.split('\n')[0]).toMatch(
      /^gh api .* && node \/tmp\/gv-send\.js <<'EOF'$/
    );
    expect(command && inputOf(command).changes).toEqual([radius]);
    expect(sendText(args)).toContain(command);
    expect(terminalCommand({ ...args, tasks: ['change: C'] })).toBeUndefined();
    expect(terminalCommand({ ...args, tokenPatch: '[ x ]' })).toBeUndefined();
    expect(terminalCommand({ ...args, edits: [] })).toBeUndefined();
  });

  it('makes the review by hand when no change has an exact edit', () => {
    const text = sendText({
      branch: 'design-system/button-k3f9',
      reviewer: null,
      edits: [],
      tasks: ['change: A'],
      gone: [],
      tokenPatch: '',
    });
    expect(text).not.toContain('gv-send.js');
    expect(text).toContain(
      'Make branch design-system/button-k3f9 off origin/design-system/workbench'
    );
    expect(text).toContain('a draft, nobody asked');
    expect(text).toContain('Changes:\n\nchange: A');
  });
});

describe('put-back line edits', () => {
  it('read back as line edits; words do not', () => {
    const e: LineEdit = {
      subject: 'design-system(heal): Badge radius 8px \u2192 --gv-radius-2',
      file: 'front/app/x.tsx',
      line: 3,
      old: 'a',
      new: 'b',
    };
    expect(lineEditOfUndo(undoOfLineEdit(e))).toEqual({
      ...e,
      subject:
        'design-system(heal): put back Badge radius 8px \u2192 --gv-radius-2',
      old: 'b',
      new: 'a',
    });
    expect(
      lineEditOfUndo('put back: Badge \u00b7 x \u00b7 8px')
    ).toBeUndefined();
    expect(lineEditOfUndo('{"file":1}')).toBeUndefined();
  });
});

describe('statusOf', () => {
  it('reads merged and closed first', () => {
    expect(
      statusOf(pull({ merged_at: '2026-10-28T10:00:00Z', state: 'closed' }), [])
        .state
    ).toBe('merged');
    expect(statusOf(pull({ state: 'closed' }), []).state).toBe('closed');
  });

  it('puts an open request over earlier verdicts', () => {
    expect(
      statusOf(pull({ requested_reviewers: [{ login: 'amirabayoumi' }] }), [
        { user: { login: 'amirabayoumi' }, state: 'CHANGES_REQUESTED' },
      ])
    ).toEqual({ state: 'review', who: ['amirabayoumi'] });
  });

  it("takes each reviewer's latest verdict, changes over approvals", () => {
    const reviews = [
      { user: { login: 'EdwinKato' }, state: 'CHANGES_REQUESTED' },
      { user: { login: 'EdwinKato' }, state: 'COMMENTED' },
      { user: { login: 'IvaKop' }, state: 'APPROVED' },
    ];
    expect(statusOf(pull(), reviews)).toEqual({
      state: 'changes',
      who: ['EdwinKato'],
    });
    reviews.push({ user: { login: 'EdwinKato' }, state: 'APPROVED' });
    expect(statusOf(pull(), reviews)).toEqual({
      state: 'approved',
      who: ['EdwinKato', 'IvaKop'],
    });
    expect(statusOf(pull(), []).state).toBe('none');
  });

  it('says it with first names', () => {
    expect(statusText({ state: 'review', who: ['amirabayoumi'] })).toBe(
      'With Amira for review'
    );
    expect(
      statusText({ state: 'approved', who: ['EdwinKato', 'IvaKop'] })
    ).toBe('Approved by Edwin and Iva');
    expect(statusText({ state: 'changes', who: ['someone'] })).toBe(
      '@someone asked for changes'
    );
    expect(statusText({ state: 'none', who: [] })).toBe(
      'Waiting for a reviewer'
    );
    expect(nameOf('luucvanderzee')).toBe('Luuc');
    expect(REVIEWERS.map((r) => r.name)).toEqual([
      'Amira',
      'Edwin',
      'Luuc',
      'Iva',
    ]);
  });
});

describe('a send is confirmed by GitHub', () => {
  const first = withCopy({ ...EMPTY, branch: 'design-system/button-k3f9' }, [
    item('a', '1'),
  ]);

  it('the first time when the PR shows on the branch', () => {
    expect(first.pending?.sent).toEqual({
      a: { value: '1', undo: 'put back: a' },
    });
    const linked = withPull(first, pull(), []);
    expect(linked.pr).toBe(15071);
    expect(linked.head).toBe('aaa');
    expect(linked.sent).toEqual({ a: { value: '1', undo: 'put back: a' } });
    expect(linked.pending).toBeUndefined();
  });

  it('later when the PR head moves after the copy', () => {
    const linked: SendRecord = withPull(first, pull(), []);
    const again = withCopy(linked, [item('a', '1'), item('b', '2')]);
    expect(again.pending?.head).toBe('aaa');
    const same = withPull(again, pull(), []);
    expect(same.pending).toBeDefined();
    expect(Object.keys(same.sent)).toEqual(['a']);
    const moved = withPull(again, pull({ head: { sha: 'bbb' } }), []);
    expect(moved.pending).toBeUndefined();
    expect(Object.keys(moved.sent)).toEqual(['a', 'b']);
  });
});

describe('freshKeys', () => {
  const record: SendRecord = {
    sent: { a: { value: '1', undo: '' }, b: { value: '2', undo: '' } },
    status: { state: 'merged', who: [] },
  };

  it('drops what went in with a merge, keeps what changed since', () => {
    expect(freshKeys({ a: '1', b: '3', c: '4' }, record)).toEqual(['a']);
  });

  it('drops nothing after a close', () => {
    expect(
      freshKeys({ a: '1' }, { ...record, status: { state: 'closed', who: [] } })
    ).toEqual([]);
  });
});
