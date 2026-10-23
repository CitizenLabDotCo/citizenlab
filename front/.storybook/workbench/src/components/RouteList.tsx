import { useEffect, useMemo, useRef, useState } from 'react';

import type { Office, RouteRef } from '../lib/review';

import Icon from './Icon';
import Segmented from './Segmented';

export const OFFICE_LABEL: Record<Office, string> = {
  admin: 'Back office',
  public: 'Front office',
};

export type RouteItem = RouteRef & {
  offSpec: number;
  files: number;
  // Params the fixture has no record for: the route cannot be opened.
  unfilled: string[];
  affected: boolean;
};

type Props = {
  routes: RouteItem[];
  // Counts per office before the office filter, for the segmented control.
  officeCounts: Record<Office | 'all', number>;
  selected?: string;
  onSelect: (path: string) => void;
  office: Office | 'all';
  onOffice: (o: Office | 'all') => void;
  search: string;
  onSearch: (q: string) => void;
  only: boolean;
  onOnly: (on: boolean) => void;
  affectedCount: number;
  components: string[];
  component?: string;
  onComponent: (c?: string) => void;
  // A commit filter set from the Changes tab, with its label.
  commit?: { sha: string; label: string };
  onClearCommit: () => void;
  unmapped: string[];
};

// `admin/projects/$projectId` as `/admin/projects/:projectId`, params set
// apart.
export const RoutePath = ({ path }: { path: string }) => (
  <code className="wb-rpath">
    {path === '' ? (
      <span>/</span>
    ) : (
      path
        .split('/')
        .map((s, i) => (
          <span key={i}>
            /
            {s.startsWith('$') ? (
              <span className="wb-rpath-param">:{s.slice(1)}</span>
            ) : (
              s
            )}
          </span>
        ))
    )}
  </code>
);

const UNMAPPED_FIRST = 40;

// The route list of the Review page: filters on top, routes grouped by
// office, and the files no route reaches at the end, so nothing hides.
const RouteList = ({
  routes,
  officeCounts,
  selected,
  onSelect,
  office,
  onOffice,
  search,
  onSearch,
  only,
  onOnly,
  affectedCount,
  components,
  component,
  onComponent,
  commit,
  onClearCommit,
  unmapped,
}: Props) => {
  const [allUnmapped, setAllUnmapped] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  // A route opened from a link (the Usage panel) is shown in the list.
  useEffect(() => {
    if (!selected) return;
    const row = scroller.current?.querySelector<HTMLElement>(
      '[aria-current="true"]'
    );
    if (row && scroller.current) {
      const box = scroller.current.getBoundingClientRect();
      const r = row.getBoundingClientRect();
      if (r.top < box.top || r.bottom > box.bottom) {
        scroller.current.scrollTop += r.top - box.top - box.height / 3;
      }
    }
  }, [selected, routes.length]);
  const groups = useMemo(
    () =>
      (['admin', 'public'] as Office[])
        .map((o) => ({
          office: o,
          routes: routes.filter((r) => r.office === o),
        }))
        .filter((g) => g.routes.length > 0),
    [routes]
  );

  return (
    <div className="wb-rlist" data-testid="wb-review-routes">
      <div className="wb-rlist-filters">
        <label className="wb-rlist-search">
          <Icon name="search" size={16} />
          <span className="wb-visually-hidden">Search routes</span>
          <input
            type="search"
            placeholder="Search routes"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            data-testid="wb-review-search"
          />
        </label>
        <label className="wb-rlist-component">
          <span>Component</span>
          <select
            value={component ?? ''}
            onChange={(e) => onComponent(e.target.value || undefined)}
            data-testid="wb-review-component"
          >
            <option value="">Any component</option>
            {components.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <Segmented<Office | 'all'>
          label="Office"
          value={office}
          onChange={onOffice}
          testId="wb-review-office"
          options={[
            { value: 'all', label: 'All', count: officeCounts.all },
            {
              value: 'admin',
              label: 'Back',
              title: OFFICE_LABEL.admin,
              count: officeCounts.admin,
            },
            {
              value: 'public',
              label: 'Front',
              title: OFFICE_LABEL.public,
              count: officeCounts.public,
            },
          ]}
        />
        <label className="wb-check wb-rlist-only">
          <input
            type="checkbox"
            className="wb-switch"
            checked={only}
            onChange={(e) => onOnly(e.target.checked)}
            data-testid="wb-review-only"
          />
          <span>
            Only routes my changes touch
            <span className="wb-rlist-only-count">{affectedCount}</span>
          </span>
        </label>
        {commit && (
          <div className="wb-rlist-commit" data-testid="wb-review-commit">
            <span>
              Routes of <code>{commit.sha.slice(0, 8)}</code> {commit.label}
            </span>
            <button
              type="button"
              className="wb-icon-button"
              onClick={onClearCommit}
              aria-label="Show all routes"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="wb-rlist-scroll" ref={scroller}>
        {routes.length === 0 ? (
          <div className="wb-rlist-none" data-testid="wb-review-routes-none">
            <Icon name="route" size={24} />
            <strong>No route matches</strong>
            <p>
              {only
                ? 'Your changes touch no route with these filters. Edit a token or turn the filter off.'
                : 'Try another search, component or office.'}
            </p>
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.office} className="wb-rlist-group">
              <h3>
                {OFFICE_LABEL[g.office]}
                <span className="wb-count">{g.routes.length}</span>
              </h3>
              <ul>
                {g.routes.map((r) => (
                  <li key={r.path}>
                    <button
                      type="button"
                      className="wb-rrow"
                      aria-current={r.path === selected ? 'true' : undefined}
                      onClick={() => onSelect(r.path)}
                      data-testid="wb-review-route"
                      data-path={r.path}
                      data-office={r.office}
                      title={`/${r.path}`}
                    >
                      <RoutePath path={r.path} />
                      <span className="wb-rrow-meta">
                        <span className={`wb-ochip wb-ochip-${r.office}`}>
                          {OFFICE_LABEL[r.office]}
                        </span>
                        {r.offSpec > 0 && (
                          <span
                            title={`${r.offSpec} off-spec values in ${r.files} files`}
                          >
                            {r.offSpec.toLocaleString('en')} off-spec
                          </span>
                        )}
                        {r.affected && (
                          <span className="wb-rrow-changed">
                            <span className="wb-diff-dot" aria-hidden="true" />
                            Changed
                          </span>
                        )}
                        {r.unfilled.length > 0 && (
                          <span
                            className="wb-rrow-record"
                            title={`No record for ${r.unfilled
                              .map((p) => `$${p}`)
                              .join(', ')}`}
                          >
                            Needs a record
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}

        {unmapped.length > 0 && (
          <details
            className="wb-rlist-unmapped"
            data-testid="wb-review-unmapped"
          >
            <summary>
              <span>Unmapped files</span>
              <span className="wb-count">{unmapped.length}</span>
            </summary>
            <p className="wb-muted">
              {component
                ? `Files using ${component} that no route reaches.`
                : 'Scanned files no route reaches: the app shell, shared code and unused files.'}
            </p>
            <ul>
              {(allUnmapped ? unmapped : unmapped.slice(0, UNMAPPED_FIRST)).map(
                (f) => (
                  <li key={f}>
                    <code>{f}</code>
                  </li>
                )
              )}
            </ul>
            {unmapped.length > UNMAPPED_FIRST && (
              <button
                type="button"
                className="wb-ulist-more"
                onClick={() => setAllUnmapped((a) => !a)}
              >
                {allUnmapped
                  ? 'Show fewer'
                  : `Show all ${unmapped.length.toLocaleString('en')}`}
              </button>
            )}
          </details>
        )}
      </div>
    </div>
  );
};

export default RouteList;
