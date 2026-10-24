import { execFileSync } from 'child_process';
import fs from 'fs';
import http from 'http';
import type { AddressInfo } from 'net';
import os from 'os';
import path from 'path';

import { fileJournal } from './journal';
import { APP_ROOT, createApi, gitIn, SOURCE } from './server';

const FRONT = path.resolve(__dirname, '../../..');
const COMPONENT = 'app/components/Thing/index.tsx';
const LIBRARY = 'app/component-library/components/Pill/index.tsx';
const componentText = [
  "import React from 'react';",
  '',
  "import styled from 'styled-components';",
  '',
  'const Wrap = styled.div`',
  '  margin-left: 12px;',
  '`;',
  '',
  'export default () => <Wrap />;',
  '',
].join('\n');

let dir: string;
let remote: string;
let server: http.Server;
let base: string;

const sh = (cwd: string, ...args: string[]) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' });

const put = (rel: string, text: string) => {
  fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
  fs.writeFileSync(path.join(dir, rel), text);
};
const get = (rel: string) => fs.readFileSync(path.join(dir, rel), 'utf8');

// Node's own http: the jest environment swaps fetch for a browser one.
const call = (
  route: string,
  body?: unknown,
  headers: Record<string, string> = { origin: base }
) =>
  new Promise<{ status: number; json: any }>((resolve, reject) => {
    const req = http.request(
      `${base}${route}`,
      {
        method: body === undefined ? 'GET' : 'POST',
        headers: { 'content-type': 'application/json', ...headers },
      },
      (res) => {
        let text = '';
        res.on('data', (c) => (text += c));
        res.on('end', () =>
          resolve({ status: res.statusCode ?? 0, json: JSON.parse(text) })
        );
      }
    );
    req.on('error', reject);
    req.end(body === undefined ? undefined : JSON.stringify(body));
  });

const space3 = '/primitive/space/3/$value';

beforeEach(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-local-'));
  remote = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-remote-'));
  sh(remote, 'init', '--bare', '-q');
  sh(dir, 'init', '-q', '-b', 'design-system/x');
  sh(dir, 'config', 'user.email', 'tali@example.com');
  sh(dir, 'config', 'user.name', 'Tali');
  sh(dir, 'remote', 'add', 'origin', remote);
  put(SOURCE, fs.readFileSync(path.join(FRONT, SOURCE), 'utf8'));
  for (const f of ['tokens.css', 'tokens.ts', 'tokens.meta.json']) {
    const rel = `app/design-system/tokens/${f}`;
    put(rel, fs.readFileSync(path.join(FRONT, rel), 'utf8'));
  }
  put(COMPONENT, componentText);
  put(LIBRARY, componentText);
  put(APP_ROOT, "import React from 'react';\n\nexport default () => null;\n");
  put(
    '.storybook/static/design-scan.json',
    JSON.stringify({
      findings: [
        { file: COMPONENT, line: 6, col: 16, raw: '12px', category: 'px' },
        { file: LIBRARY, line: 6, col: 16, raw: '12px', category: 'px' },
      ],
    })
  );
  sh(dir, 'add', '-A');
  sh(dir, 'commit', '-qm', 'start');
  sh(dir, 'push', '-q', 'origin', 'HEAD:master');

  const api = createApi({
    root: dir,
    journal: fileJournal(path.join(dir, '.git/ds-local/journal.json')),
    git: gitIn(dir),
  });
  server = http.createServer((req, res) =>
    api(req, res, () => {
      res.statusCode = 404;
      res.end('{}');
    })
  );
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterEach(async () => {
  await new Promise((r) => server.close(r));
  fs.rmSync(dir, { recursive: true, force: true });
  fs.rmSync(remote, { recursive: true, force: true });
});

const before = () =>
  JSON.parse(get(SOURCE)).primitive.space['3'].$value as string;

it('writes a token edit to the source and its outputs, and undoes it', async () => {
  const from = before();
  const r = await call('/__ds/token', {
    patch: [
      { op: 'test', path: space3, value: from },
      { op: 'replace', path: space3, value: '13px' },
    ],
    label: 'Space 3 to 13px',
  });
  expect(r.status).toBe(200);
  expect(r.json.edits).toHaveLength(1);
  expect(get('app/design-system/tokens/tokens.css')).toContain(
    '--gv-space-3: 13px;'
  );
  const live = await call('/__ds/tokens');
  expect(live.json.source.primitive.space['3'].$value).toBe('13px');
  expect(live.json.meta.find((t: any) => t.name === '--gv-space-3').value).toBe(
    '13px'
  );
  const undo = await call('/__ds/undo', { id: r.json.edits[0].id });
  expect(undo.json.edits).toHaveLength(0);
  expect(before()).toBe(from);
  expect(sh(dir, 'status', '--porcelain')).toBe('');
});

it('refuses a stale token edit', async () => {
  const r = await call('/__ds/token', {
    patch: [
      { op: 'test', path: space3, value: '999px' },
      { op: 'replace', path: space3, value: '13px' },
    ],
  });
  expect(r.status).toBe(409);
  expect(r.json.error).toMatch(/moved on/);
});

it('writes a style edit, loads the tokens once, and undoes both', async () => {
  const r = await call('/__ds/style', {
    file: COMPONENT,
    line: 6,
    col: 16,
    token: '--gv-space-3',
    label: 'Thing margin to space 3',
  });
  expect(r.status).toBe(200);
  expect(r.json.edits.map((e: any) => e.kind)).toEqual(['setup', 'style']);
  expect(get(COMPONENT)).toContain('margin-left: ${t.space[3]};');
  expect(get(COMPONENT)).toContain(
    "import { t } from 'design-system/tokens/tokens';"
  );
  expect(get(APP_ROOT)).toContain("import 'design-system/tokens/tokens.css';");

  const style = r.json.edits[1].id;
  await call('/__ds/undo', { id: style });
  expect(get(COMPONENT)).toBe(componentText);
  const setup = await call('/__ds/undo', { id: r.json.edits[0].id });
  expect(setup.json.edits).toHaveLength(0);
  expect(sh(dir, 'status', '--porcelain')).toBe('');
});

it('undoes a style edit after the file moved on elsewhere', async () => {
  const r = await call('/__ds/style', {
    file: COMPONENT,
    line: 6,
    col: 16,
    token: '--gv-space-3',
  });
  put(COMPONENT, `${get(COMPONENT)}// a later note\n`);
  const undo = await call('/__ds/undo', { id: r.json.edits[1].id });
  expect(undo.status).toBe(200);
  expect(get(COMPONENT)).toBe(`${componentText}// a later note\n`);
});

it('refuses a place the scan did not find, and files outside app', async () => {
  const off = await call('/__ds/style', {
    file: COMPONENT,
    line: 2,
    col: 1,
    token: '--gv-space-3',
  });
  expect(off.status).toBe(400);
  const out = await call('/__ds/style', {
    file: '../package.json',
    line: 1,
    col: 1,
    value: '1px',
  });
  expect(out.json.error).toMatch(/under app/);
});

it('answers only pages of its own origin', async () => {
  const r = await call(
    '/__ds/undo',
    { id: 'x' },
    { origin: 'https://evil.example' }
  );
  expect(r.status).toBe(403);
  const none = await call('/__ds/undo', { id: 'x' }, {});
  expect(none.status).toBe(403);
});

it('commits and pushes through git, then empties the list', async () => {
  const from = before();
  await call('/__ds/token', {
    patch: [
      { op: 'test', path: space3, value: from },
      { op: 'replace', path: space3, value: '13px' },
    ],
    label: 'Space 3 to 13px',
  });
  const r = await call('/__ds/push', {});
  expect(r.status).toBe(200);
  expect(r.json.pushed[0].subject).toBe(
    'design-system(token): Space 3 to 13px'
  );
  expect(r.json.edits).toHaveLength(0);
  expect(sh(remote, 'log', '--format=%s', '-1', 'design-system/x').trim()).toBe(
    'design-system(token): Space 3 to 13px'
  );
  expect(sh(dir, 'status', '--porcelain')).toBe('');
});

it('asks for a branch on master', async () => {
  sh(dir, 'switch', '-qc', 'master');
  const from = before();
  await call('/__ds/token', {
    patch: [
      { op: 'test', path: space3, value: from },
      { op: 'replace', path: space3, value: '13px' },
    ],
  });
  const r = await call('/__ds/push', {});
  expect(r.status).toBe(409);
  const named = await call('/__ds/push', { branch: 'design-system/space-3' });
  expect(named.status).toBe(200);
  expect(named.json.pushed[0].branch).toBe('design-system/space-3');
});

const heads = () =>
  sh(remote, 'for-each-ref', '--format=%(refname:short)', 'refs/heads')
    .trim()
    .split('\n');

it('pushes a component edit as a heal off master, not on this branch', async () => {
  await call('/__ds/style', {
    file: COMPONENT,
    line: 6,
    col: 16,
    value: '16px',
    label: 'Thing margin 12px to 16px',
  });
  const mine = sh(dir, 'rev-parse', 'HEAD');
  const r = await call('/__ds/push', {});
  expect(r.status).toBe(200);
  const heal = r.json.pushed[0];
  expect(heal.kind).toBe('heal');
  expect(heal.branch).toBe('design-system/heal-thing-margin-12px-to-16px');
  expect(sh(remote, 'rev-parse', `${heal.branch}^`)).toBe(
    sh(remote, 'rev-parse', 'master')
  );
  expect(sh(remote, 'show', `${heal.branch}:${COMPONENT}`)).toContain(
    'margin-left: 16px;'
  );
  expect(sh(dir, 'rev-parse', 'HEAD')).toBe(mine);
  expect(get(COMPONENT)).toBe(componentText);
  expect(r.json.edits).toHaveLength(0);

  // The same name again gets a number.
  await call('/__ds/style', {
    file: COMPONENT,
    line: 6,
    col: 16,
    value: '16px',
    label: 'Thing margin 12px to 16px',
  });
  const again = await call('/__ds/push', {});
  expect(again.json.pushed[0].branch).toBe(`${heal.branch}-2`);
});

it('heals onto a token when master has the tokens, then drops the setup', async () => {
  await call('/__ds/style', {
    file: COMPONENT,
    line: 6,
    col: 16,
    token: '--gv-space-3',
  });
  const r = await call('/__ds/push', {});
  expect(r.json.held).toBeNull();
  expect(
    sh(remote, 'show', `${r.json.pushed[0].branch}:${COMPONENT}`)
  ).toContain('${t.space[3]}');
  expect(r.json.edits).toHaveLength(0);
  expect(sh(dir, 'status', '--porcelain')).toBe('');
});

it('holds a heal onto a token while master has no tokens', async () => {
  sh(dir, 'rm', '-rq', '--cached', 'app/design-system/tokens');
  sh(dir, 'commit', '-qm', 'no tokens');
  sh(dir, 'push', '-qf', 'origin', 'HEAD:master');
  sh(dir, 'reset', '-q', '--hard', 'HEAD~1');
  await call('/__ds/style', {
    file: COMPONENT,
    line: 6,
    col: 16,
    token: '--gv-space-3',
  });
  const r = await call('/__ds/push', {});
  expect(r.status).toBe(200);
  expect(r.json.pushed).toHaveLength(0);
  expect(r.json.held).toMatch(/no tokens yet/);
  expect(r.json.edits.map((e: any) => e.kind)).toEqual(['setup', 'style']);
  expect(heads()).toEqual(['master']);
});

it('refuses a heal when the file differs on master', async () => {
  await call('/__ds/style', {
    file: COMPONENT,
    line: 6,
    col: 16,
    value: '1px',
  });
  const saved = get(COMPONENT);
  put(COMPONENT, `${componentText}// moved on\n`);
  sh(dir, 'commit', '-qam', 'moved');
  sh(dir, 'push', '-q', 'origin', 'HEAD:master');
  put(COMPONENT, saved);
  const r = await call('/__ds/push', {});
  expect(r.status).toBe(409);
  expect(r.json.error).toMatch(/differs on master/);
  expect(heads()).toEqual(['master']);
});

it('writes the variable in the component library', async () => {
  const r = await call('/__ds/style', {
    file: LIBRARY,
    line: 6,
    col: 16,
    token: '--gv-space-3',
  });
  expect(r.status).toBe(200);
  expect(get(LIBRARY)).toContain('margin-left: var(--gv-space-3);');
  expect(get(LIBRARY)).not.toContain("design-system/tokens/tokens'");
  expect(r.json.edits.map((e: any) => e.kind)).toEqual(['setup', 'style']);
});
