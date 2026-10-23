// The read-only guard against a real browser and a local server. Runs only
// where Playwright resolves (see ./playwright); skipped elsewhere.
import http from 'http';
import { AddressInfo } from 'net';
import { clearImmediate, setImmediate } from 'timers';

import {
  BlockedRequest,
  clickPhase,
  guardContext,
  GuardWhere,
  LOAD_PHASE,
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

describe('guardContext', () => {
  let server: http.Server;
  let base = '';
  const seen: string[] = [];

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      seen.push(`${req.method} ${req.url}`);
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(req.method === 'GET' ? PAGE : 'written');
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
});
