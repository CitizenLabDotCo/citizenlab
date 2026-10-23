import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@ds/tokens/tokens.css';
import './shell.css';
import App from './App';
import { applyTheme, readTheme } from './lib/theme';

// Before the first paint, so a dark viewer never sees a white flash.
applyTheme(readTheme());

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
