// The local write API behind `npm run ds:local`, mounted on the Storybook
// dev server (the workbench's own origin):
//
//   GET  /__ds/status   branch, the saved edits not yet pushed
//   GET  /__ds/tokens   the token source and metadata as they are now
//   POST /__ds/token    { patch, label }               token source edit
//   POST /__ds/style    { file, line, col, token | value, label }
//                       a component's own style value, at a scan finding
//   POST /__ds/undo     { id }
//   POST /__ds/push     { branch?, heal? }   the person's own git push
//
// A push commits token edits on the current branch (a new one when that is
// master), and component edits as a heal: their own branch off
// origin/master, built without a checkout, so platform code never lands on
// the branch the workbench lives on. It writes only the token source and
// its outputs, and component files at a place the scan found; it answers
// only this machine and this origin.
import { execFileSync } from 'child_process';
import fs from 'fs';
import type { IncomingMessage, ServerResponse } from 'http';
import path from 'path';

import { renderOutputs, tObject, TokenSource } from '../build-tokens';

import { Entry, FileChange, Journal, unswap } from './journal';
import {
  accessors,
  applyTokenPatch,
  CSS_IMPORT,
  ensureCssImport,
  inversePatch,
  isPatch,
  T_IMPORT,
  writeStyle,
} from './writes';

export const SOURCE = 'app/design-system/tokens/tokens.source.json';
export const APP_ROOT = 'app/containers/App/index.tsx';
const META = 'app/design-system/tokens/tokens.meta.json';
const SCAN = '.storybook/static/design-scan.json';
const PROTECTED = new Set(['master', 'main', 'production', 'HEAD']);
const BRANCH = /^design-system\/[a-z0-9][a-z0-9-]{1,60}$/;
// Files here may not import from design-system/; they read the variable.
const VAR_ONLY = 'app/component-library/';
const MAX_BODY = 200_000;

export type Deps = {
  // The front folder; every path below is relative to it.
  root: string;
  journal: Journal;
  git: (
    args: string[],
    opts?: { env?: Record<string, string>; input?: string }
  ) => string;
  // Formats the files about to be committed (eslint --fix); best effort.
  format?: (files: string[]) => void;
};

class Refusal extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

const isLoopback = (a?: string) =>
  !!a && (a === '::1' || a.startsWith('127.') || a === '::ffff:127.0.0.1');

// Only this machine, and only pages of this origin (no other site in the
// same browser can post here).
const allowed = (req: IncomingMessage) => {
  if (!isLoopback(req.socket.remoteAddress)) return false;
  if (req.method === 'GET') return true;
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] ?? req.headers.host;
  return !!origin && !!host && new URL(origin).host === host;
};

const readBody = (req: IncomingMessage) =>
  new Promise<any>((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY) reject(new Refusal('Too large.', 413));
      else chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(new Refusal('Not JSON.'));
      }
    });
    req.on('error', reject);
  });

const send = (res: ServerResponse, status: number, body: unknown) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

const label = (v: unknown) =>
  typeof v === 'string' && v.trim()
    ? v
        .trim()
        .replace(/[\r\n]+/g, ' ')
        .slice(0, 120)
    : 'Edit';

// A plain CSS value a component may take: short, nothing that loads a
// resource or leaves the declaration.
const LITERAL = /^[#\w.%(), -]{1,64}$/;

type Finding = {
  file: string;
  line: number;
  col: number;
  raw: string;
  category: string;
};

export const createApi = (deps: Deps) => {
  const abs = (rel: string) => path.join(deps.root, rel);
  const read = (rel: string) => fs.readFileSync(abs(rel), 'utf8');
  const exists = (rel: string) => fs.existsSync(abs(rel));
  const write = (rel: string, text: string) => fs.writeFileSync(abs(rel), text);

  // Writes the source and its generated outputs; the changed files with
  // their old and new text.
  const writeSource = (text: string) => {
    const outputs = renderOutputs(JSON.parse(text) as TokenSource);
    const files = [{ file: SOURCE, content: text }, ...outputs].map(
      ({ file, content }) => ({
        file,
        before: exists(file) ? read(file) : '',
        after: content,
      })
    );
    const changed = files.filter((f) => f.before !== f.after);
    changed.forEach((f) => write(f.file, f.after));
    return changed;
  };

  const tokenEdit = (body: any) => {
    if (!isPatch(body.patch)) throw new Refusal('Send a JSON Patch.');
    let next: string;
    try {
      next = applyTokenPatch(read(SOURCE), body.patch);
      renderOutputs(JSON.parse(next));
    } catch (e) {
      throw new Refusal(e instanceof Error ? e.message : String(e), 409);
    }
    const files = writeSource(next);
    return deps.journal.add({
      kind: 'token',
      label: label(body.label),
      files,
      patch: body.patch,
    });
  };

  const findingAt = (file: string, line: number, col: number) => {
    const scan = JSON.parse(read(SCAN)) as { findings: Finding[] };
    return scan.findings.find(
      (f) => f.file === file && f.line === line && f.col === col
    );
  };

  const styleEdit = (body: any) => {
    const { file, line, col, token, value } = body;
    if (
      typeof file !== 'string' ||
      !/^app\/[\w./ -]+\.tsx?$/.test(file) ||
      file.includes('..') ||
      !exists(file)
    ) {
      throw new Refusal('Only a component file under app/.');
    }
    if (!Number.isInteger(line) || !Number.isInteger(col)) {
      throw new Refusal('Send the line and column of the value.');
    }
    const finding = findingAt(file, line, col);
    if (!finding) {
      throw new Refusal(
        'The scan found no value at that place; run npm run ds:scan.'
      );
    }
    let to: string;
    let literal = false;
    const byToken = typeof token === 'string';
    if (byToken && file.startsWith(VAR_ONLY)) {
      const meta = JSON.parse(read(META)) as { name: string }[];
      if (!/^--gv-[\w-]+$/.test(token) || !meta.some((m) => m.name === token)) {
        throw new Refusal(`${token} is not a token.`);
      }
      to = `var(${token})`;
      literal = true;
    } else if (byToken) {
      const accessor = accessors(
        tObject(JSON.parse(read(SOURCE)) as TokenSource)
      ).get(token);
      if (!accessor) {
        throw new Refusal(
          `${token} has no entry in t (a tenant slot or deprecated); hand this one to the agent.`
        );
      }
      to = accessor;
    } else if (typeof value === 'string' && LITERAL.test(value.trim())) {
      to = value.trim();
      literal = true;
    } else {
      throw new Refusal('Send a token or a plain CSS value.');
    }
    const before = read(file);
    const r = writeStyle(before, finding, to, literal);
    if (!r.ok) throw new Refusal(r.error, 409);
    write(file, r.text);
    const entries: Entry[] = [];
    // The platform loads the tokens stylesheet once, so what it reads from
    // `t` is defined.
    if (byToken && exists(APP_ROOT)) {
      const app = read(APP_ROOT);
      const withCss = ensureCssImport(app);
      if (withCss !== app) {
        write(APP_ROOT, withCss);
        entries.push(
          deps.journal.add({
            kind: 'setup',
            label: 'The platform loads the tokens (one line in the app root)',
            files: [{ file: APP_ROOT, before: app, after: withCss }],
          })
        );
      }
    }
    entries.push(
      deps.journal.add({
        kind: 'style',
        label: label(body.label),
        files: [{ file, before, after: r.text }],
        swap: { file, line: r.line, from: r.from, to: r.to },
      })
    );
    return entries;
  };

  const undo = (id: unknown) => {
    const entry = deps.journal.list().find((e) => e.id === id);
    if (!entry) throw new Refusal('No such edit.', 404);
    if (entry.kind === 'token' && entry.patch) {
      let next: string;
      try {
        next = applyTokenPatch(read(SOURCE), inversePatch(entry.patch));
      } catch (e) {
        throw new Refusal(
          `${e instanceof Error ? e.message : e} Undo it in the file.`,
          409
        );
      }
      writeSource(next);
    } else {
      for (const f of entry.files) {
        const now = read(f.file);
        let back: string | undefined = now === f.after ? f.before : undefined;
        if (back === undefined && entry.swap?.file === f.file) {
          back = unswap(now, entry.swap);
          // The last token read gone: the import goes too.
          if (
            back !== undefined &&
            !/\bt\.[a-z]/.test(back.replace(T_IMPORT, ''))
          ) {
            back = back.replace(`${T_IMPORT}\n`, '');
          }
        }
        if (back === undefined && entry.kind === 'setup') {
          back = now.replace(`${CSS_IMPORT}\n`, '');
        }
        if (back === undefined) {
          throw new Refusal(
            `${f.file} changed since this edit; undo it in the file.`,
            409
          );
        }
        write(f.file, back);
      }
    }
    deps.journal.remove(entry.id);
  };

  const gitOr = (args: string[]) => {
    try {
      return deps.git(args).trim();
    } catch {
      return undefined;
    }
  };

  const status = () => {
    const branch = gitOr(['rev-parse', '--abbrev-ref', 'HEAD']) ?? 'HEAD';
    const upstream = gitOr(['rev-parse', '--abbrev-ref', '@{u}']);
    return {
      branch,
      protected: PROTECTED.has(branch),
      upstream: upstream ?? null,
      ahead: upstream
        ? Number(gitOr(['rev-list', '--count', '@{u}..HEAD']) ?? 0)
        : null,
      edits: deps.journal.list().map(({ files, ...e }) => ({
        ...e,
        files: files.map((f) => f.file),
      })),
    };
  };

  const subjectOf = (kind: string, edits: Entry[]) => {
    const named = edits.map((e) => e.label);
    const head = named.length === 1 ? named[0] : `${named.length} edits`;
    return {
      subject: `design-system(${kind}): ${head}`.slice(0, 100),
      body: `From the workbench:\n${named.map((l) => `- ${l}`).join('\n')}`,
    };
  };

  const pushTokens = (edits: Entry[], body: any) => {
    let branch = gitOr(['rev-parse', '--abbrev-ref', 'HEAD']) ?? 'HEAD';
    if (PROTECTED.has(branch)) {
      const name = body.branch;
      if (typeof name !== 'string' || !BRANCH.test(name)) {
        throw new Refusal(
          `You are on ${branch}. Name a branch, design-system/<what-it-does>, and push again.`,
          409
        );
      }
      deps.git(['switch', '-c', name]);
      branch = name;
    }
    const files = [
      ...new Set(edits.flatMap((e) => e.files.map((f) => f.file))),
    ];
    deps.git(['add', '--', ...files]);
    const { subject, body: text } = subjectOf('token', edits);
    deps.git(['commit', '-m', subject, '-m', text]);
    const sha = deps.git(['rev-parse', 'HEAD']).trim();
    const upstream = gitOr(['rev-parse', '--abbrev-ref', '@{u}']);
    try {
      deps.git(upstream ? ['push'] : ['push', '-u', 'origin', branch]);
    } catch (e) {
      // Committed but not pushed: the edits stay in git, the list empties.
      edits.forEach((e) => deps.journal.remove(e.id));
      throw new Refusal(
        `Committed ${sha.slice(0, 7)} on ${branch}, but the push failed: ${
          e instanceof Error ? e.message.split('\n')[0] : e
        }. Run git push in the terminal.`,
        502
      );
    }
    edits.forEach((e) => deps.journal.remove(e.id));
    return { kind: 'token', sha, branch, subject };
  };

  const readsToken = (e: Entry) => /\bt\.|var\(--gv-/.test(e.swap?.to ?? '');

  // Component edits, chained per file from master's own text, committed on
  // a new branch off origin/master through a scratch index: no checkout,
  // the working tree untouched until the push is through.
  const pushHeal = (edits: Entry[], body: any) => {
    deps.git(['fetch', '-q', 'origin', 'master']);
    const master = 'refs/remotes/origin/master';
    const prefix = gitOr(['rev-parse', '--show-prefix']) ?? '';
    const byFile = new Map<string, FileChange[]>();
    for (const e of edits) {
      for (const f of e.files) {
        byFile.set(f.file, [...(byFile.get(f.file) ?? []), f]);
      }
    }
    const index = path.join(
      deps.git(['rev-parse', '--absolute-git-dir']).trim(),
      'ds-local',
      'heal-index'
    );
    fs.mkdirSync(path.dirname(index), { recursive: true });
    const env = { GIT_INDEX_FILE: index };
    deps.git(['read-tree', master], { env });
    const finals = new Map<string, string>();
    for (const [file, changes] of byFile) {
      let onMaster: string;
      try {
        onMaster = deps.git(['cat-file', 'blob', `${master}:${prefix}${file}`]);
      } catch {
        throw new Refusal(`${file} is not on master.`, 409);
      }
      changes.forEach((c, i) => {
        const from = i === 0 ? onMaster : changes[i - 1].after;
        if (c.before !== from) {
          throw new Refusal(
            `${file} differs on master from what was edited; pull master into your branch, or hand this one to the agent.`,
            409
          );
        }
      });
      // Formatted in place when the file is as the last edit left it.
      let final = changes[changes.length - 1].after;
      if (read(file) === final && /\.tsx?$/.test(file)) {
        deps.format?.([file]);
        final = read(file);
      }
      finals.set(file, final);
      const blob = deps
        .git(['hash-object', '-w', '--stdin'], { input: final })
        .trim();
      deps.git(
        ['update-index', '--cacheinfo', `100644,${blob},${prefix}${file}`],
        { env }
      );
    }
    const tree = deps.git(['write-tree'], { env }).trim();
    fs.rmSync(index, { force: true });
    const { subject, body: text } = subjectOf('heal', edits);
    const sha = deps
      .git(['commit-tree', tree, '-p', master, '-m', subject, '-m', text])
      .trim();
    const slug = (edits[0].label.toLowerCase().match(/[a-z0-9]+/g) ?? ['edit'])
      .join('-')
      .slice(0, 40)
      .replace(/-$/, '');
    let branch =
      typeof body.heal === 'string' && BRANCH.test(body.heal)
        ? body.heal
        : `design-system/heal-${slug}`;
    const taken = (b: string) =>
      !!gitOr(['ls-remote', '--heads', 'origin', `refs/heads/${b}`]);
    for (let n = 2; taken(branch); n++) {
      branch = `${branch.replace(/-\d+$/, '')}-${n}`;
    }
    try {
      deps.git(['push', '-q', 'origin', `${sha}:refs/heads/${branch}`]);
    } catch (e) {
      throw new Refusal(
        `The push failed: ${
          e instanceof Error ? e.message.split('\n')[0] : e
        }. The edits stay saved.`,
        502
      );
    }
    // On its branch now: this checkout goes back to how it was.
    for (const [file, changes] of byFile) {
      if (read(file) === finals.get(file)) {
        write(file, changes[0].before);
      }
    }
    edits.forEach((e) => deps.journal.remove(e.id));
    return { kind: 'heal', sha, branch, subject };
  };

  const push = (body: any) => {
    const edits = deps.journal.list();
    const tokens = edits.filter((e) => e.kind === 'token');
    const styles = edits.filter((e) => e.kind === 'style');
    if (!tokens.length && !styles.length) throw new Refusal('Nothing to push.');
    // A heal onto a token waits until master has the tokens (Iva's call).
    let masterHasTokens = false;
    if (styles.some(readsToken)) {
      deps.git(['fetch', '-q', 'origin', 'master']);
      const prefix = gitOr(['rev-parse', '--show-prefix']) ?? '';
      masterHasTokens =
        gitOr([
          'cat-file',
          '-e',
          `refs/remotes/origin/master:${prefix}app/design-system/tokens/tokens.ts`,
        ]) !== undefined;
    }
    const heals = styles.filter((e) => masterHasTokens || !readsToken(e));
    const held = styles.filter((e) => !heals.includes(e));
    const pushed = [];
    if (heals.length) pushed.push(pushHeal(heals, body));
    if (tokens.length) pushed.push(pushTokens(tokens, body));
    // Nothing left that reads a token: the app root goes back too.
    if (!held.length) {
      deps.journal
        .list()
        .filter((e) => e.kind === 'setup')
        .forEach((e) => undo(e.id));
    }
    return {
      pushed,
      held: held.length
        ? `${
            held.length === 1 ? 'One edit reads' : `${held.length} edits read`
          } a token, and master has no tokens yet; it stays saved here until they land.`
        : null,
    };
  };

  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) => {
    const url = (req.url ?? '').split('?')[0];
    if (!url.startsWith('/__ds/')) return next();
    if (!allowed(req)) return send(res, 403, { error: 'Local use only.' });
    try {
      if (req.method === 'GET' && url === '/__ds/status') {
        return send(res, 200, status());
      }
      if (req.method === 'GET' && url === '/__ds/tokens') {
        return send(res, 200, {
          source: JSON.parse(read(SOURCE)),
          meta: JSON.parse(read(META)),
        });
      }
      if (req.method !== 'POST') throw new Refusal('Not found.', 404);
      const body = await readBody(req);
      if (url === '/__ds/token') {
        tokenEdit(body);
      } else if (url === '/__ds/style') {
        styleEdit(body);
      } else if (url === '/__ds/undo') {
        undo(body.id);
      } else if (url === '/__ds/push') {
        return send(res, 200, { ...push(body), ...status() });
      } else {
        throw new Refusal('Not found.', 404);
      }
      return send(res, 200, status());
    } catch (e) {
      const status = e instanceof Refusal ? e.status : 500;
      return send(res, status, {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  };
};

export const gitIn =
  (cwd: string): Deps['git'] =>
  (args, opts = {}) =>
    execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0', ...opts.env },
      input: opts.input,
      stdio: [opts.input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
    });
