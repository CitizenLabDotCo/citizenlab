import { useEffect, useMemo, useRef, useState } from 'react';

import GalleryFrame from '../components/GalleryFrame';
import Icon from '../components/Icon';
import Segmented from '../components/Segmented';
import StoryThumb from '../components/StoryThumb';
import { A11yResults, checklistOf } from '../lib/a11y';
import { CHECKLISTS } from '../lib/checklists';
import {
  ALL,
  byArea,
  filterGroups,
  GalleryFilter,
  GallerySet,
  Office,
  Status,
  StoryGroup,
} from '../lib/stories';
import { THUMB_FRAME_WIDTH } from '../lib/thumbs';
import { useA11yResults } from '../lib/useA11y';
import { useStoryGroups } from '../lib/useStoryGroups';

import { PlaceholderArt } from './Placeholder';

import type { FrameGlobals } from '../lib/frame';

const OFFICES: { value: Office | 'all'; label: string; title?: string }[] = [
  { value: 'all', label: 'All' },
  {
    value: 'bo',
    label: 'Back office',
    title: 'Used in the back office, shared ones included',
  },
  {
    value: 'fo',
    label: 'Front office',
    title: 'Used in the front office, shared ones included',
  },
  { value: 'shared', label: 'Shared' },
];

const STATUSES: { value: Status | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'on-tokens', label: 'On tokens' },
  { value: 'partly', label: 'Partly' },
  { value: 'off-tokens', label: 'Not on tokens yet' },
  { value: 'no-styles', label: 'No styles of its own' },
  { value: 'no-file', label: 'No component file' },
];

// The set in the hash (`#/components?set=redesigned`), so a link opens the
// redesign view straight away.
const setOfHash = (): GallerySet =>
  new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('set') ===
  'redesigned'
    ? 'redesigned'
    : 'all';

const writeSetToHash = (set: GallerySet) => {
  const [path, query] = window.location.hash.split('?');
  const params = new URLSearchParams(query ?? '');
  if (set === 'all') params.delete('set');
  else params.set('set', set);
  const q = params.toString();
  window.history.replaceState(null, '', q ? `${path}?${q}` : path);
};

type Props = {
  globals: FrameGlobals;
};

const SkeletonGrid = () => (
  <ul className="wb-card-grid wb-thumb-grid" aria-label="Loading">
    {Array.from({ length: 8 }, (_, i) => (
      <li key={i}>
        <div className="wb-card wb-thumb-card wb-skeleton-card">
          <span className="wb-thumb wb-thumb-loading" />
          <span className="wb-thumb-body">
            <span className="wb-skeleton-line" />
            <span className="wb-skeleton-line wb-skeleton-short" />
          </span>
        </div>
      </li>
    ))}
  </ul>
);

// The redesign view: one block per area of the new back office, so the
// whole set reads at a glance.
const AreaGrids = ({
  groups,
  globals,
  results,
}: {
  groups: StoryGroup[];
  globals: FrameGlobals;
  results: A11yResults | null;
}) => (
  <div className="wb-area-blocks" data-testid="wb-gallery-areas">
    {byArea(groups).map(({ area, groups: list }) => (
      <section
        key={area}
        className="wb-gallery-group wb-area-block"
        aria-label={area}
      >
        <h2 className="wb-section-title">
          {area}
          <span className="wb-area-count">{list.length}</span>
        </h2>
        <Grid groups={list} globals={globals} results={results} />
      </section>
    ))}
  </div>
);

const Grid = ({
  groups,
  globals,
  results,
  frameWidth = THUMB_FRAME_WIDTH.components,
  testId,
}: {
  groups: StoryGroup[];
  globals: FrameGlobals;
  results: A11yResults | null;
  frameWidth?: number;
  testId?: string;
}) => (
  <ul className="wb-card-grid wb-thumb-grid" data-testid={testId}>
    {groups.map((g) => (
      <li key={g.title}>
        <StoryThumb
          group={g}
          href={`#/components/${encodeURIComponent(g.defaultId)}`}
          globals={globals}
          frameWidth={frameWidth}
          a11y={{ results, checklist: checklistOf(CHECKLISTS, g) }}
        />
      </li>
    ))}
  </ul>
);

// Stories filed outside Components/, laid out wider: their preview frame
// is a second one, so it boots only once someone scrolls to them.
const Others = ({
  groups,
  globals,
  results,
}: {
  groups: StoryGroup[];
  globals: FrameGlobals;
  results: A11yResults | null;
}) => {
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return undefined;
    const observer = new IntersectionObserver(
      (records) => {
        if (records.some((r) => r.isIntersecting)) setNear(true);
      },
      { rootMargin: '600px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [near]);
  return (
    <section ref={ref} className="wb-gallery-group">
      <h2 className="wb-section-title">Pages and other stories</h2>
      <p className="wb-section-note">
        Stories filed outside <code>Components/</code>, such as{' '}
        <code>Pages/</code>, <code>Cards/</code> and{' '}
        <code>HomepageBuilder/</code>, laid out wider.
      </p>
      {near && (
        <GalleryFrame globals={globals} frameWidth={THUMB_FRAME_WIDTH.pages}>
          <Grid
            groups={groups}
            globals={globals}
            results={results}
            frameWidth={THUMB_FRAME_WIDTH.pages}
            testId="wb-gallery-others"
          />
        </GalleryFrame>
      )}
    </section>
  );
};

// The gallery: a thumbnail per story title, with the scan's score, status
// and office, filtered by set, office, status and name. Stories filed
// outside Components/ (pages, cards, the homepage builder) close it, laid
// out wider. The cards show before the scan has loaded; its parts follow.
const Gallery = ({ globals }: Props) => {
  const all = useStoryGroups({ early: true });
  const { results } = useA11yResults();
  const [filter, setFilter] = useState<GalleryFilter>(() => ({
    ...ALL,
    set: setOfHash(),
  }));
  useEffect(() => writeSetToHash(filter.set), [filter.set]);
  const components = useMemo(
    () => all?.filter((g) => g.section === 'components') ?? [],
    [all]
  );
  const others = useMemo(
    () => all?.filter((g) => g.section !== 'components') ?? [],
    [all]
  );
  const pool = [...components, ...others];
  const shown = filterGroups(components, filter);
  const shownOthers = filterGroups(others, filter);
  const filtered =
    filter.office !== ALL.office ||
    filter.status !== ALL.status ||
    filter.set !== ALL.set ||
    filter.query.trim() !== '';
  const shownCount = shown.length + shownOthers.length;
  const countOf = (patch: Partial<GalleryFilter>) =>
    filterGroups(pool, { ...filter, ...patch }).length;
  // A status filter with one value filters nothing: it hides then.
  const statuses = STATUSES.filter(
    (s) =>
      s.value === 'all' ||
      s.value === filter.status ||
      pool.some((g) => g.status === s.value)
  ).map((s) => ({ ...s, count: countOf({ status: s.value }) }));
  const hasRedesigned = pool.some((g) => g.redesigned);
  const sets = [
    { value: 'all' as const, label: 'All', count: countOf({ set: 'all' }) },
    {
      value: 'redesigned' as const,
      label: 'Redesigned',
      count: countOf({ set: 'redesigned' }),
      title:
        'The new back office: the project pages Edwin and Amira rebuilt, and the back-office styles they added to the library',
    },
  ];
  const byAreas = filter.set === 'redesigned';
  const set = (patch: Partial<GalleryFilter>) =>
    setFilter((f) => ({ ...f, ...patch }));

  return (
    <article className="wb-page wb-page-wide" data-testid="wb-gallery">
      <header className="wb-page-head wb-page-head-row">
        <div>
          <h1>Components</h1>
        </div>
      </header>

      {all === null ? (
        <SkeletonGrid />
      ) : pool.length === 0 ? (
        <section className="wb-empty" aria-label="No stories yet">
          <PlaceholderArt />
          <div className="wb-empty-text">
            <span className="wb-badge wb-badge-soon">No stories yet</span>
            <h2>No stories in this build</h2>
            <p className="wb-muted">
              A story shows up here, with its score and office from the scan.
            </p>
          </div>
        </section>
      ) : (
        <>
          <div className="wb-filters" role="search" aria-label="Filter">
            <label className="wb-search wb-filter-search">
              <span className="wb-visually-hidden">Search components</span>
              <Icon name="search" size={16} />
              <input
                type="search"
                placeholder="Search components"
                value={filter.query}
                data-testid="wb-gallery-search"
                onChange={(e) => set({ query: e.target.value })}
              />
            </label>
            {(hasRedesigned || filter.set !== 'all') && (
              <div className="wb-filter">
                <span className="wb-filter-label">Set</span>
                <Segmented
                  label="Set"
                  value={filter.set}
                  options={sets}
                  onChange={(s) => set({ set: s })}
                  testId="wb-filter-set"
                />
              </div>
            )}
            <div className="wb-filter">
              <span className="wb-filter-label">Office</span>
              <Segmented
                label="Office"
                value={filter.office}
                options={OFFICES}
                onChange={(office) => set({ office })}
                testId="wb-filter-office"
              />
            </div>
            {statuses.length > 2 && (
              <div className="wb-filter">
                <span className="wb-filter-label">Status</span>
                <Segmented
                  label="Status"
                  value={filter.status}
                  options={statuses}
                  onChange={(status) => set({ status })}
                  testId="wb-filter-status"
                />
              </div>
            )}
          </div>

          <p className="wb-result-count" aria-live="polite">
            {`${shownCount} of ${pool.length}`}
            {filtered && (
              <button
                type="button"
                className="wb-link-button"
                onClick={() => setFilter(ALL)}
              >
                Clear filters
              </button>
            )}
          </p>

          {shownCount === 0 && (
            <div className="wb-empty-filter" data-testid="wb-gallery-empty">
              <span className="wb-empty-filter-icon">
                <Icon name="search" size={22} />
              </span>
              <h2>Nothing matches these filters</h2>
              <p className="wb-muted">
                Try another office or status, or clear the search.
              </p>
              <button type="button" onClick={() => setFilter(ALL)}>
                Clear filters
              </button>
            </div>
          )}

          <GalleryFrame
            globals={globals}
            frameWidth={THUMB_FRAME_WIDTH.components}
          >
            {byAreas && shown.length > 0 && (
              <AreaGrids groups={shown} globals={globals} results={results} />
            )}
            {!byAreas && shown.length > 0 && (
              <Grid
                groups={shown}
                globals={globals}
                results={results}
                testId="wb-gallery-grid"
              />
            )}
          </GalleryFrame>

          {shownOthers.length > 0 && (
            <Others groups={shownOthers} globals={globals} results={results} />
          )}
        </>
      )}
    </article>
  );
};

export default Gallery;
