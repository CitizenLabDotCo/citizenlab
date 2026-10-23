// The read-only guard against a real browser and a local server. Runs only
// where Playwright resolves (see ./playwright); skipped elsewhere.
import http from 'http';
import { AddressInfo } from 'net';
import { clearImmediate, setImmediate } from 'timers';

import {
  BlockedRequest,
  clickPhase,
  clickToOpen,
  guardContext,
  GuardWhere,
  loadPage,
  LOAD_PHASE,
  runOpens,
  summariseBlocked,
} from './audit';
import { tryLoadPlaywright } from './playwright';

// The repo's jest runs in jsdom, which lacks these; Playwright needs them.
Object.assign(globalThis, { setImmediate, clearImmediate });

const pw = tryLoadPlaywright();
const maybe = pw ? it : it.skip;

const PAGE = `<!doctype html><main>
<button id="write" type="button" onclick="fetch('/api/mark_read?token=s3cret', {method: 'POST', body: 'x'}).catch(() => {}); document.body.dataset.clicked = '1'">Mark read</button>
<button id="beacon" type="button" onclick="navigator.sendBeacon('/api/beacon', 'x')">Beacon</button>
<button id="socket" type="button" onclick="new WebSocket('ws://' + location.host + '/cable')">Socket</button>
<form method="post" action="/api/form"><button id="submit">Save</button></form>
</main>
<script>fetch('/api/sessions', {method: 'POST'}).catch(() => {})</script>`;

// A submenu: step A posts, leaves a beforeunload write and a pagehide
// beacon behind, then shows B. "Delete all" is on the deny list.
const CHAIN = `<!doctype html><main>
<button id="a" type="button" onclick="fetch('/api/a', {method: 'POST'}).catch(() => {}); window.addEventListener('beforeunload', () => fetch('/api/unload', {method: 'POST', keepalive: true})); window.addEventListener('pagehide', () => navigator.sendBeacon('/api/pagehide', 'x')); document.getElementById('sub').hidden = false">Step A</button>
<button id="del" type="button" onclick="fetch('/api/deleted', {method: 'POST'}).catch(() => {}); document.getElementById('sub').hidden = false">Delete all</button>
<div id="sub" hidden><button id="b" type="button">Step B</button></div>
</main>
<script>fetch('/api/sessions', {method: 'POST'}).catch(() => {})</script>`;

describe('guardContext', () => {
  let server: http.Server;
  let base = '';
  const seen: string[] = [];

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      seen.push(`${req.method} ${req.url}`);
      res.writeHead(200, { 'content-type': 'text/html' });
      const page = req.url?.startsWith('/chain') ? CHAIN : PAGE;
      res.end(req.method === 'GET' ? page : 'written');
    });
    server.on('upgrade', (req, socket) => {
      seen.push(`UPGRADE ${req.url}`);
      socket.destroy();
    });
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => new Promise<void>((r) => server.close(() => r())));

  maybe(
    'blocks load-time and click writes, and tells them apart by phase',
    async () => {
      const browser = await pw.chromium.launch({ chromiumSandbox: false });
      try {
        const context = await browser.newContext({ serviceWorkers: 'block' });
        const blocked: BlockedRequest[] = [];
        const where: GuardWhere = { route: '/home', phase: LOAD_PHASE };
        await guardContext(context, blocked, where);
        const page = await context.newPage();
        await page.goto(base, { waitUntil: 'load' });
        await page.waitForTimeout(300);
        for (const id of ['write', 'beacon', 'socket', 'submit']) {
          where.phase = clickPhase(id);
          await page.click(`#${id}`);
          await page.waitForTimeout(300);
        }
        expect(seen.filter((s) => !s.startsWith('GET '))).toEqual([]);
        const line = (b: BlockedRequest) =>
          `${b.method} ${b.path} ${b.route} ${b.phase}`;
        expect([...new Set(blocked.map(line))].sort()).toEqual([
          'POST /api/beacon /home after-click:beacon',
          'POST /api/form /home after-click:submit',
          'POST /api/mark_read /home after-click:write',
          'POST /api/sessions /home load',
          'WEBSOCKET /cable /home after-click:socket',
        ]);
        expect(JSON.stringify(blocked)).not.toContain('s3cret');
        const s = summariseBlocked(blocked);
        expect([s.onLoad, s.afterClick, s.sockets]).toEqual([1, 3, 1]);
      } finally {
        await browser.close();
      }
    },
    30000
  );

  maybe(
    'runs --open chains: click phases per chain, reloads as load, deny list and missing steps',
    async () => {
      const browser = await pw.chromium.launch({ chromiumSandbox: false });
      try {
        const context = await browser.newContext({ serviceWorkers: 'block' });
        const blocked: BlockedRequest[] = [];
        const where: GuardWhere = { route: '/chain', phase: LOAD_PHASE };
        await guardContext(context, blocked, where);
        const page = await context.newPage();
        const url = `${base}/chain`;
        const load = () => loadPage(page, url, where, '/chain');
        await load();
        await page.waitForTimeout(200);
        const opened: string[] = [];
        const logged: string[] = [];
        let reloads = 0;
        const result = await runOpens(
          page,
          ['#a -> #b', '#del -> #b', '#missing -> #b', '#a->#b'],
          {
            where,
            log: (l) => logged.push(l),
            reload: async () => {
              reloads++;
              await load();
              await page.waitForTimeout(200);
              return '';
            },
            open: (h, label) =>
              clickToOpen(page, h, label, where, async (l) => {
                opened.push(l);
              }),
          }
        );
        expect(result.stopped).toBe('');
        expect(result.missed).toBe(
          '--open #missing -> #b: step "#missing" has no visible allowed match'
        );
        expect(reloads).toBe(3);
        expect(opened).toEqual(['#a -> #b', '#a->#b']);
        expect(logged).toContain(
          'skipped a match of --open #del: "Delete all" is in the header or on the deny list'
        );
        const line = (b: BlockedRequest) => `${b.method} ${b.path} ${b.phase}`;
        const lines = blocked.map(line);
        // Nothing reached the server, the deny-listed step was never
        // clicked, and the pagehide handler never ran (UNLOAD_GUARD).
        expect(seen.filter((x) => !x.startsWith('GET '))).toEqual([]);
        expect(lines.some((l) => l.includes('/api/deleted'))).toBe(false);
        expect(lines.some((l) => l.includes('/api/pagehide'))).toBe(false);
        expect([...new Set(lines)].sort()).toEqual([
          'POST /api/a after-click:#a -> #b',
          'POST /api/a after-click:#a->#b',
          'POST /api/sessions load',
          // Sent as the page unloads for the reload: still the click's.
          'POST /api/unload after-click:#a -> #b',
        ]);
        expect(
          lines.filter((l) => l === 'POST /api/sessions load')
        ).toHaveLength(4);
        expect(summariseBlocked(blocked).afterClick).toBe(3);
      } finally {
        await browser.close();
      }
    },
    30000
  );

  maybe(
    'stops at an intermediate step that navigates',
    async () => {
      const browser = await pw.chromium.launch({ chromiumSandbox: false });
      try {
        const context = await browser.newContext({ serviceWorkers: 'block' });
        const where: GuardWhere = { route: '/chain', phase: LOAD_PHASE };
        await guardContext(context, [], where);
        const page = await context.newPage();
        await page.setContent(
          `<main><a id="go" role="button" href="${base}/chain">Go</a><button id="b">B</button></main>`
        );
        const opened: string[] = [];
        const result = await runOpens(page, ['#go -> #b', '#b'], {
          where,
          log: () => undefined,
          reload: async () => '',
          open: async (_h, label) => {
            opened.push(label);
            return '';
          },
        });
        expect(result.stopped).toBe('#go -> #b: step "#go": navigated');
        expect(opened).toEqual([]);
      } finally {
        await browser.close();
      }
    },
    30000
  );
});
