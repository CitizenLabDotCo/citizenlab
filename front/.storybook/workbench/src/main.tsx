import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@ds/tokens/tokens.css';
import './shell.css';
import App from './App';
import { setLiveTokens } from './lib/data';
import { detectLocal, loadLiveTokens, LocalStatus } from './lib/local';
import { applyTheme, readTheme } from './lib/theme';

// Before the first paint, so a dark viewer never sees a white flash.
applyTheme(readTheme());

// The local API answers this machine only, so only a page served next to the
// platform on it asks for it: a hosted copy paints without waiting.
const LOOPBACK = ['localhost', '127.0.0.1', '[::1]'];

const boot = async () => {
  let local: LocalStatus | undefined;
  if (
    LOOPBACK.includes(window.location.hostname) &&
    window.location.pathname.startsWith('/storybook/')
  ) {
    local = await detectLocal();
    if (local) {
      try {
        setLiveTokens(await loadLiveTokens());
      } catch {
        local = undefined;
      }
    }
  }
  createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <App local={local} />
    </StrictMode>
  );
};

boot();
