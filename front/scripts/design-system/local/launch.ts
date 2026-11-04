// `npm run ds:local`: the platform on a remote back end and the workbench
// behind one address, no database and no Docker.
//
//   API_URL=https://<tenant host> npm run ds:local
//   then open http://localhost:3000/storybook/workbench/
//
// The platform's own dev server (vite.config.ts) serves the platform at /
// and proxies the back end to API_URL; Storybook runs next to it and is
// proxied under /storybook/. One origin, so the workbench can frame the
// platform and read what it renders. The write API (/__ds/) saves edits
// to the source and pushes them through this machine's git.
import { execFileSync, spawn } from 'child_process';
import path from 'path';

import {
  createServer,
  loadConfigFromFile,
  mergeConfig,
  type Plugin,
  type PluginOption,
} from 'vite';

import { fileJournal } from './journal';
import { createApi, gitIn } from './server';

const FRONT = path.resolve(__dirname, '../../..');
const PORT = Number(process.env.PORT) || 3000;
const SB_PORT = Number(process.env.DS_STORYBOOK_PORT) || 6006;
const BASE = '/storybook/';

if (!process.env.API_URL) {
  console.error(
    'Set API_URL to the platform to work against, for example\n' +
      '  API_URL=https://prototype.stg.govocal.com npm run ds:local'
  );
  process.exit(1);
}

const git = gitIn(FRONT);
const gitDir = path.resolve(FRONT, git(['rev-parse', '--git-dir']).trim());

const storybook = spawn(
  'npx',
  [
    'storybook',
    'dev',
    '-p',
    String(SB_PORT),
    '--ci',
    '--no-open',
    '--host',
    '127.0.0.1',
  ],
  {
    cwd: FRONT,
    stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env, DS_LOCAL_BASE: BASE },
  }
);
const stop = () => {
  storybook.kill();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
storybook.on('exit', (code) => {
  console.error(`Storybook stopped (${code}).`);
  process.exit(code ?? 1);
});

const writeApi = (): Plugin => ({
  name: 'ds-local-api',
  configureServer(server) {
    const api = createApi({
      root: FRONT,
      journal: fileJournal(path.join(gitDir, 'ds-local/journal.json')),
      git,
      format: (files) => {
        try {
          execFileSync('npx', ['eslint', '--fix', ...files], {
            cwd: FRONT,
            stdio: 'ignore',
            timeout: 120_000,
          });
        } catch {
          // Formatting is a courtesy (eslint exits non-zero on any warning
          // left); the push goes on.
        }
      },
    });
    server.middlewares.use((req, res, next) => {
      api(req, res, next).catch(next);
    });
  },
});

const sbTarget = `http://127.0.0.1:${SB_PORT}`;

// Storybook first: both bundling their dependencies at once is a lot of
// memory on a small machine.
const storybookReady = async () => {
  for (let i = 0; i < 600; i++) {
    try {
      const res = await fetch(`${sbTarget}/index.json`);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('Storybook did not start.');
};

const main = async () => {
  await storybookReady();
  const loaded = await loadConfigFromFile(
    { command: 'serve', mode: 'development' },
    path.join(FRONT, 'vite.config.ts')
  );
  if (!loaded) throw new Error('No vite.config.ts');
  // The type checker is the editor's job here; it would double the memory.
  const plugins = (loaded.config.plugins ?? [])
    .flat(Infinity as 1)
    .filter(
      (p: PluginOption) =>
        !(p && typeof p === 'object' && 'name' in p && /checker/.test(p.name))
    );
  const config = mergeConfig(
    { ...loaded.config, plugins },
    {
      configFile: false,
      mode: 'development',
      plugins: [writeApi()],
      server: {
        port: PORT,
        strictPort: true,
        proxy: {
          // Storybook's routes (manager, iframe, index.json, the workbench)
          // live at its root; its Vite modules answer with or without the
          // prefix, and its module graph asks for them prefixed.
          [BASE]: {
            target: sbTarget,
            ws: true,
            rewrite: (p: string) => {
              if (
                /^\/storybook\/(@|node_modules\/|\.storybook\/|app\/|src\/)/.test(
                  p
                )
              ) {
                return p;
              }
              const rest = p.slice(BASE.length - 1);
              // Storybook's static files have no folder index.
              return rest.replace(
                /^\/workbench\/?(\?|#|$)/,
                '/workbench/index.html$1'
              );
            },
          },
          '/storybook-server-channel': { target: sbTarget, ws: true },
        },
      },
    }
  );
  const server = await createServer(config);
  await server.listen();
  console.log(
    `\n  The workbench: http://localhost:${PORT}/storybook/workbench/` +
      `\n  The platform:  http://localhost:${PORT}/  (back end ${process.env.API_URL})\n`
  );
};

main().catch((e) => {
  console.error(e);
  storybook.kill();
  process.exit(1);
});
