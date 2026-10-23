// The read-only guard against a real browser and a local server. Runs only
// where Playwright resolves (see ./playwright); skipped elsewhere.
import http from 'http';
import { AddressInfo } from 'net';
import { clearImmediate, setImmediate } from 'timers';

import { guardContext } from './audit';
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
</main>`;

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
    'blocks a POST, a beacon, a form submit and a WebSocket from clicks',
    async () => {
      const browser = await pw.chromium.launch({ chromiumSandbox: false });
      try {
        const context = await browser.newContext({ serviceWorkers: 'block' });
        const blocked: string[] = [];
        await guardContext(context, blocked);
        const page = await context.newPage();
        await page.goto(base, { waitUntil: 'load' });
        for (const id of ['write', 'beacon', 'socket', 'submit']) {
          await page.click(`#${id}`);
          await page.waitForTimeout(300);
        }
        expect(seen.filter((s) => !s.startsWith('GET '))).toEqual([]);
        expect([...new Set(blocked)].sort()).toEqual([
          'POST /api/beacon',
          'POST /api/form',
          'POST /api/mark_read',
          'WEBSOCKET /cable',
        ]);
        expect(blocked.join('\n')).not.toContain('s3cret');
      } finally {
        await browser.close();
      }
    },
    30000
  );
});
