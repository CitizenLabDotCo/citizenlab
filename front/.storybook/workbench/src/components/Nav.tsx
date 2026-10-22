import { useState } from 'react';

import type { Route } from '../lib/router';

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
    hint: 'Turn edits into a change',
  },
];

type Props = { current: Route['name'] };

const Nav = ({ current }: Props) => {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const entries = q
    ? NAV.filter((e) => `${e.label} ${e.hint}`.toLowerCase().includes(q))
    : NAV;

  return (
    <nav className="wb-nav" aria-label="Workbench">
      <div className="wb-brand">Design workbench</div>
      <label className="wb-search">
        <span className="wb-visually-hidden">Search</span>
        <input
          type="search"
          placeholder="Search"
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
            >
              {e.label}
            </a>
          </li>
        ))}
        {entries.length === 0 && <li className="wb-nav-empty">No match</li>}
      </ul>
    </nav>
  );
};

export default Nav;
