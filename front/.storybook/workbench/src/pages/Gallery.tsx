import { useEffect, useMemo, useState } from 'react';

import GalleryFrame from '../components/GalleryFrame';
import Icon from '../components/Icon';
import InUseGrid from '../components/InUseGrid';
import Segmented from '../components/Segmented';
import StoryThumb from '../components/StoryThumb';
import { A11yResults, checklistOf } from '../lib/a11y';
import { CHECKLISTS } from '../lib/checklists';
import { loadCrops, loadScan } from '../lib/data';
import { buildInUse, filterInUse, InUseRow } from '../lib/inUse';
import {
  ALL,
  byArea,
  filterGroups,
  GalleryFilter,
  GallerySet,
  Office,
  Section,
  Status,
  StoryGroup,
} from '../lib/stories';
import { THUMB_FRAME_WIDTH } from '../lib/thumbs';
import { useA11yResults } from '../lib/useA11y';
import { useStoryGroups } from '../lib/useStoryGroups';

import { PlaceholderArt } from './Placeholder';

import type { FrameGlobals } from '../lib/frame';

const COPY: Record<Section, { title: string; lead?: string; noun: string }> = {
  components: {
    title: 'Components',
    noun: 'component',
  },
  patterns: {
    title: 'Patterns',
    lead: 'Compositions of components that pages repeat, rendered live.',
    noun: 'pattern',
  },
  pages: {
    title: 'Pages',
    lead: 'Whole pages of the platform, rendered live from their stories.',
    noun: 'page',
  },
};

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
  { value: 'off-tokens', label: 'Off tokens' },
  { value: 'unscanned', label: 'Not scanned' },
];

type View = 'library' | 'inuse';

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

// Every component the scan found the platform using, joined with the story
// groups and the crops; null while the scan and crops.json load.
const useInUse = (groups: StoryGroup[] | null): InUseRow[] | null => {
  const [rows, setRows] = useState<InUseRow[] | null>(null);
  useEffect(() => {
    if (!groups) return undefined;
    let live = true;
    Promise.all([loadScan(), loadCrops()]).then(([scan, crops]) => {
      if (live) setRows(buildInUse(scan.components, groups, crops));
    });
    return () => {
      live = false;
    };
  }, [groups]);
  return rows;
};

type Props = {
  section: Section;
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
  section,
  globals,
  results,
}: {
  groups: StoryGroup[];
  section: Section;
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
        <Grid
          groups={list}
          section={section}
          globals={globals}
          results={results}
        />
      </section>
    ))}
  </div>
);

const Grid = ({
  groups,
  section,
  globals,
  results,
  testId,
}: {
  groups: StoryGroup[];
  section: Section;
  globals: FrameGlobals;
  results: A11yResults | null;
  testId?: string;
}) => (
  <ul className="wb-card-grid wb-thumb-grid" data-testid={testId}>
    {groups.map((g) => (
      <li key={g.title}>
        <StoryThumb
          group={g}
          href={`#/${section}/${encodeURIComponent(g.defaultId)}`}
          globals={globals}
          frameWidth={THUMB_FRAME_WIDTH[section]}
          a11y={{ results, checklist: checklistOf(CHECKLISTS, g) }}
        />
      </li>
    ))}
  </ul>
);

// The gallery of one section: a live thumbnail per story title under
// `<Section>/`, with the scan's score, status and office, filtered by
// office, status and name. Patterns also lists the stories whose title
// starts with no section, so none of them is out of reach.
const Gallery = ({ section, globals }: Props) => {
  const all = useStoryGroups();
  const { results } = useA11yResults();
  const [filter, setFilter] = useState<GalleryFilter>(() => ({
    ...ALL,
    set: setOfHash(),
  }));
  useEffect(() => writeSetToHash(filter.set), [filter.set]);
  const [view, setView] = useState<View>('library');
  const inUse = useInUse(section === 'components' ? all : null);
  const copy = COPY[section];
  const mine = useMemo(
    () => all?.filter((g) => g.section === section) ?? [],
    [all, section]
  );
  const unfiled = useMemo(
    () =>
      section === 'patterns'
        ? all?.filter((g) => g.section === null) ?? []
        : [],
    [all, section]
  );
  const pool = [...mine, ...unfiled];
  const shown = filterGroups(mine, filter);
  const shownUnfiled = filterGroups(unfiled, filter);
  const filtered =
    filter.office !== ALL.office ||
    filter.status !== ALL.status ||
    filter.set !== ALL.set ||
    filter.query.trim() !== '';
  const inuse = section === 'components' && view === 'inuse';
  const inUseShown = inUse ? filterInUse(inUse, filter) : [];
  const total = inuse ? inUse?.length ?? 0 : pool.length;
  const shownCount = inuse
    ? inUseShown.length
    : shown.length + shownUnfiled.length;
  const countOf = (status: Status | 'all') =>
    inuse
      ? filterInUse(inUse ?? [], { ...filter, status }).length
      : filterGroups(pool, { ...filter, status }).length;
  const present = (status: Status) =>
    inuse
      ? inUse?.some((r) => r.score.status === status)
      : pool.some((g) => g.status === status);
  // A status filter with one value filters nothing: it hides then.
  const statuses = STATUSES.filter(
    (s) => s.value === 'all' || s.value === filter.status || present(s.value)
  ).map((s) => ({ ...s, count: countOf(s.value) }));
  const redesignedCount = inuse
    ? filterInUse(inUse ?? [], { ...filter, set: 'redesigned' }).length
    : filterGroups(pool, { ...filter, set: 'redesigned' }).length;
  const hasRedesigned = inuse
    ? redesignedCount > 0
    : pool.some((g) => g.redesigned);
  const sets = [
    {
      value: 'all' as const,
      label: 'All',
      count: inuse
        ? filterInUse(inUse ?? [], { ...filter, set: 'all' }).length
        : filterGroups(pool, { ...filter, set: 'all' }).length,
    },
    {
      value: 'redesigned' as const,
      label: 'Redesigned',
      count: redesignedCount,
      title:
        'The new back office: the project pages Edwin and Amira rebuilt, and the back-office styles they added to the library',
    },
  ];
  const byAreas = filter.set === 'redesigned' && !inuse;
  const set = (patch: Partial<GalleryFilter>) =>
    setFilter((f) => ({ ...f, ...patch }));

  return (
    <article className="wb-page wb-page-wide" data-testid="wb-gallery">
      <header className="wb-page-head wb-page-head-row">
        <div>
          <h1>{copy.title}</h1>
          {copy.lead && <p className="wb-lead">{copy.lead}</p>}
        </div>
      </header>

      {section === 'components' && all !== null && (
        <div className="wb-view-switch">
          <Segmented
            label="Show"
            value={view}
            options={[
              {
                value: 'library',
                label: 'Library',
                title: 'The components with a story, by name',
              },
              {
                value: 'inuse',
                label: 'In use',
                count: inUse?.length,
                title:
                  'Every component the platform uses, most used first, stories or not',
              },
            ]}
            onChange={setView}
            testId="wb-gallery-view"
          />
        </div>
      )}

      {all === null ? (
        <SkeletonGrid />
      ) : pool.length === 0 ? (
        <section className="wb-empty" aria-label="No stories yet">
          <PlaceholderArt kind={section} />
          <div className="wb-empty-text">
            <span className="wb-badge wb-badge-soon">No stories yet</span>
            <h2>{`No ${copy.noun} stories in this build`}</h2>
            <p className="wb-muted">
              {`A story whose title starts with ${copy.title}/ shows up here, with its score and office from the scan.`}
            </p>
            <a className="wb-button" href="#/components">
              Browse components
            </a>
          </div>
        </section>
      ) : (
        <>
          <div className="wb-filters" role="search" aria-label="Filter">
            <label className="wb-search wb-filter-search">
              <span className="wb-visually-hidden">{`Search ${copy.title.toLowerCase()}`}</span>
              <Icon name="search" size={16} />
              <input
                type="search"
                placeholder={`Search ${copy.title.toLowerCase()}`}
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
            {inuse
              ? `${shownCount} of ${total}, most used first`
              : `${shownCount} of ${total}`}
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

          {shownCount === 0 && !(inuse && inUse === null) && (
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
            frameWidth={THUMB_FRAME_WIDTH[section]}
          >
            {inuse && inUse === null && <SkeletonGrid />}
            {inuse && inUseShown.length > 0 && (
              <InUseGrid
                rows={inUseShown}
                globals={globals}
                frameWidth={THUMB_FRAME_WIDTH[section]}
                results={results}
              />
            )}
            {byAreas && shown.length > 0 && (
              <AreaGrids
                groups={shown}
                section={section}
                globals={globals}
                results={results}
              />
            )}
            {!byAreas && !inuse && shown.length > 0 && (
              <Grid
                groups={shown}
                section={section}
                globals={globals}
                results={results}
                testId="wb-gallery-grid"
              />
            )}
            {!byAreas && !inuse && shownUnfiled.length > 0 && (
              <section className="wb-gallery-group">
                <h2 className="wb-section-title">Outside the sections</h2>
                <p className="wb-section-note">
                  {mine.length === 0
                    ? `Nothing is filed under ${copy.title}/ yet, so this lists `
                    : 'Also here: '}
                  stories from app code whose title starts with no section, such
                  as <code>Cards/</code> and <code>HomepageBuilder/</code>. They
                  show here until they move under Patterns/ or Pages/.
                </p>
                <Grid
                  groups={shownUnfiled}
                  section={section}
                  globals={globals}
                  results={results}
                />
              </section>
            )}
          </GalleryFrame>
        </>
      )}
    </article>
  );
};

export default Gallery;
