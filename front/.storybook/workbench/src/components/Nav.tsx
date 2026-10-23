import { useEffect, useRef, useState } from 'react';

import type { Route } from '../lib/router';
import { ThemeChoice, useTheme } from '../lib/theme';

import Icon, { IconName } from './Icon';

export type NavEntry = {
  name: Route['name'];
  label: string;
  hash: string;
  hint: string;
};

export const NAV: NavEntry[] = [
  {
    name: 'start',
    label: 'Start here',
    hash: '#/start',
    hint: 'What this is and how to use it',
  },
  {
    name: 'foundations',
    label: 'Foundations',
    hash: '#/foundations',
    hint: 'Tokens by category',
  },
  {
    name: 'components',
    label: 'Components',
    hash: '#/components',
    hint: 'Every library component',
  },
  {
    name: 'patterns',
    label: 'Patterns',
    hash: '#/patterns',
    hint: 'Compositions of components',
  },
  { name: 'pages', label: 'Pages', hash: '#/pages', hint: 'Redesigned pages' },
  {
    name: 'review',
    label: 'Review',
    hash: '#/review',
    hint: 'Before and after, page by page',
  },
  {
    name: 'proposal',
    label: 'Proposal',
    hash: '#/proposal',
    hint: 'The case for developers',
  },
];

type Props = { current: Route['name'] };

// The mark of the workbench: four tiles, one of them the accent.
const BrandMark = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
    <rect width="28" height="28" rx="8" fill="var(--wb-accent-fill)" />
    <rect
      x="7"
      y="7"
      width="6"
      height="6"
      rx="1.5"
      fill="var(--wb-on-accent)"
    />
    <rect x="15" y="7" width="6" height="6" rx="3" fill="var(--gv-teal-200)" />
    <rect
      x="7"
      y="15"
      width="6"
      height="6"
      rx="1.5"
      fill="var(--gv-teal-200)"
    />
    <rect
      x="15"
      y="15"
      width="6"
      height="6"
      rx="1.5"
      fill="var(--wb-on-accent)"
    />
  </svg>
);

const THEMES: { value: ThemeChoice; label: string; icon: IconName }[] = [
  { value: 'system', label: 'Follow the system', icon: 'monitor' },
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
];

// Light, dark, or as the system is; remembered in this browser.
const ThemeSwitch = () => {
  const [theme, setTheme] = useTheme();
  return (
    <div
      className="wb-theme"
      role="group"
      aria-label="Theme"
      data-testid="wb-theme"
    >
      <span className="wb-theme-label">Theme</span>
      {THEMES.map((t) => (
        <button
          key={t.value}
          type="button"
          aria-pressed={theme === t.value}
          title={t.label}
          onClick={() => setTheme(t.value)}
        >
          <Icon name={t.icon} size={16} />
          <span className="wb-visually-hidden">{t.label}</span>
        </button>
      ))}
    </div>
  );
};

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea';

// Keeps Tab and Shift+Tab inside the element.
const trapTab = (e: KeyboardEvent, root: HTMLElement | null) => {
  if (!root) return;
  const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => el.offsetParent !== null && el.tabIndex >= 0
  );
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) return;
  const active = document.activeElement;
  if (e.shiftKey && (active === first || !root.contains(active))) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (active === last || !root.contains(active))) {
    e.preventDefault();
    first.focus();
  }
};

const Nav = ({ current }: Props) => {
  const [query, setQuery] = useState('');
  // Narrow screens: the list folds into a menu under the top bar.
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  // Escape closes the menu and hands focus back to its button.
  // Tab stays inside the open menu (its button and the list).
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        trapTab(e, navRef.current);
        return;
      }
      if (e.key !== 'Escape') return;
      setOpen(false);
      menuButton.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  const q = query.trim().toLowerCase();
  const entries = q
    ? NAV.filter((e) => `${e.label} ${e.hint}`.toLowerCase().includes(q))
    : NAV;

  return (
    <nav
      ref={navRef}
      className={open ? 'wb-nav wb-nav-open' : 'wb-nav'}
      aria-label="Workbench"
    >
      <div className="wb-nav-top">
        <a className="wb-brand" href="#/start">
          <BrandMark />
          <span>
            <span className="wb-brand-name">Design workbench</span>
            <span className="wb-brand-sub">Go Vocal design system</span>
          </span>
        </a>
        <button
          type="button"
          className="wb-menu-button"
          ref={menuButton}
          aria-expanded={open}
          aria-controls="wb-nav-body"
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'close' : 'menu'} />
          <span className="wb-visually-hidden">Menu</span>
        </button>
      </div>
      <div className="wb-nav-body" id="wb-nav-body">
        <label className="wb-search">
          <span className="wb-visually-hidden">Search</span>
          <Icon name="search" size={16} />
          <input
            type="search"
            placeholder="Search sections"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <ul className="wb-nav-list" data-testid="wb-nav">
          {entries.map((e) => (
            <li key={e.name}>
              <a
                href={e.hash}
                aria-current={e.name === current ? 'page' : undefined}
                title={e.hint}
                onClick={() => setOpen(false)}
              >
                <Icon name={e.name as IconName} />
                {e.label}
              </a>
            </li>
          ))}
          {entries.length === 0 && <li className="wb-nav-empty">No match</li>}
        </ul>
        <div className="wb-nav-foot">
          <ThemeSwitch />
          <p className="wb-nav-note">
            Edits stay in this browser until you share them as a link.
          </p>
        </div>
      </div>
      {open && (
        <button
          type="button"
          className="wb-nav-scrim"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={() => setOpen(false)}
        />
      )}
    </nav>
  );
};

export default Nav;
