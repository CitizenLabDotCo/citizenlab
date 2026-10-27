import { useEffect, useRef, useState } from 'react';

import { trapTab } from '../lib/focus';
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
    name: 'foundations',
    label: 'Foundations',
    hash: '#/foundations/color',
    hint: 'Tokens by category',
  },
  {
    name: 'components',
    label: 'Components',
    hash: '#/components',
    hint: 'Every library component',
  },
  {
    name: 'review',
    label: 'Review',
    hash: '#/review',
    hint: 'Before and after, page by page',
  },
];

type Props = {
  current: Route['name'];
  collapsed: boolean;
  onToggleCollapsed: () => void;
  // A number after an entry's label (Review: the changes collected).
  counts?: Partial<Record<Route['name'], number>>;
};

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

// Light, dark, or as the system is; remembered in this browser. A folded
// sidebar has room for one button, which steps through the three.
const ThemeSwitch = ({ compact }: { compact: boolean }) => {
  const [theme, setTheme] = useTheme();
  if (compact) {
    const i = THEMES.findIndex((t) => t.value === theme);
    const next = THEMES[(i + 1) % THEMES.length];
    const now = THEMES[i];
    return (
      <div className="wb-theme" data-testid="wb-theme">
        <button
          type="button"
          title={`Theme: ${now.label}. Switch to ${next.label.toLowerCase()}`}
          onClick={() => setTheme(next.value)}
        >
          <Icon name={now.icon} size={16} />
          <span className="wb-visually-hidden">
            Theme: {now.label}. Switch to {next.label.toLowerCase()}
          </span>
        </button>
      </div>
    );
  }
  return (
    <div
      className="wb-theme"
      role="group"
      aria-label="Theme"
      data-testid="wb-theme"
    >
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

const Nav = ({ current, collapsed, onToggleCollapsed, counts }: Props) => {
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
  return (
    <nav
      ref={navRef}
      className={[
        'wb-nav',
        open && 'wb-nav-open',
        collapsed && 'wb-nav-collapsed',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Workbench"
    >
      <div className="wb-nav-top">
        <a className="wb-brand" href="#/components" title="Design workbench">
          <BrandMark />
          <span className="wb-brand-name">Design workbench</span>
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
        <ul className="wb-nav-list" data-testid="wb-nav">
          {NAV.map((e) => (
            <li key={e.name}>
              <a
                href={e.hash}
                aria-current={e.name === current ? 'page' : undefined}
                title={collapsed ? `${e.label}: ${e.hint}` : e.hint}
                onClick={() => setOpen(false)}
              >
                <Icon name={e.name as IconName} />
                <span className="wb-nav-label">{e.label}</span>
                {!!counts?.[e.name] && (
                  <span
                    className="wb-count wb-count-on wb-nav-count"
                    data-testid={`wb-nav-count-${e.name}`}
                  >
                    {counts[e.name]}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
        <div className="wb-nav-foot">
          <a
            className="wb-nav-about"
            href="#/about"
            aria-current={current === 'about' ? 'page' : undefined}
            data-testid="wb-nav-about"
          >
            <Icon name="question" size={16} />
            <span className={collapsed ? 'wb-visually-hidden' : undefined}>
              How it works
            </span>
          </a>
          <ThemeSwitch compact={collapsed} />
          <button
            type="button"
            className="wb-nav-collapse"
            aria-expanded={!collapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onToggleCollapsed}
            data-testid="wb-nav-collapse"
          >
            <Icon name="sidebar" size={16} />
            <span className="wb-visually-hidden">
              {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </span>
          </button>
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
