import { useCallback, useEffect, useState } from 'react';

// The workbench chrome in light or dark. With no choice saved it follows
// the system setting. The choice is per viewer, kept in this browser.
export type ThemeChoice = 'system' | 'light' | 'dark';

const KEY = 'gv-workbench-theme';
const DARK = '(prefers-color-scheme: dark)';

const isChoice = (v: unknown): v is ThemeChoice =>
  v === 'system' || v === 'light' || v === 'dark';

export const readTheme = (): ThemeChoice => {
  try {
    const v = window.localStorage.getItem(KEY);
    return isChoice(v) ? v : 'system';
  } catch {
    return 'system';
  }
};

const saveTheme = (choice: ThemeChoice) => {
  try {
    if (choice === 'system') window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, choice);
  } catch {
    // Storage can be off (a private window); the choice lasts this visit.
  }
};

const systemDark = () => {
  try {
    return window.matchMedia(DARK).matches;
  } catch {
    return false;
  }
};

// Sets data-wb-theme on the root element, which shell.css reads.
export const applyTheme = (choice: ThemeChoice) => {
  const dark = choice === 'dark' || (choice === 'system' && systemDark());
  document.documentElement.dataset.wbTheme = dark ? 'dark' : 'light';
};

export const useTheme = (): [ThemeChoice, (c: ThemeChoice) => void] => {
  const [choice, setChoice] = useState<ThemeChoice>(readTheme);
  useEffect(() => {
    applyTheme(choice);
    if (choice !== 'system') return undefined;
    let query: MediaQueryList;
    try {
      query = window.matchMedia(DARK);
    } catch {
      return undefined;
    }
    const onChange = () => applyTheme('system');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [choice]);
  const set = useCallback((c: ThemeChoice) => {
    saveTheme(c);
    setChoice(c);
  }, []);
  return [choice, set];
};
