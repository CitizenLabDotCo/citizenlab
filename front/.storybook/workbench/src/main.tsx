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

const boot = async () => {
  let local: LocalStatus | undefined;
  // Only a page served next to the platform can have the local API.
  if (window.location.pathname.startsWith('/storybook/')) {
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
