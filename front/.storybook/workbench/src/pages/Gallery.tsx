import { useMemo, useState } from 'react';

import type { Mode } from '@ds/tokens/tokens';

import Icon from '../components/Icon';
import Segmented from '../components/Segmented';
import StoryThumb from '../components/StoryThumb';
import type { FrameGlobals } from '../lib/frame';
import {
  ALL,
  filterGroups,
  GalleryFilter,
  Office,
  Section,
  Status,
  StoryGroup,
} from '../lib/stories';
import { useStoryGroups } from '../lib/useStoryGroups';

import { PlaceholderArt } from './Placeholder';

const COPY: Record<Section, { title: string; lead: string; noun: string }> = {
  components: {
    title: 'Components',
    lead: 'Every library component, rendered live from its Default story. The ring is how much of the component file follows the tokens, from the latest scan.',
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

// Width each story is laid out at before it is scaled to the card: a
// phone-sized column for library components (about 80% in a desktop card,
// so labels stay readable), wider for patterns and pages.
const THUMB_FRAME_WIDTH: Record<Section, number> = {
  components: 320,
  patterns: 520,
  pages: 520,
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

type Props = {
  section: Section;
  globals: FrameGlobals;
  onMode: (mode: Mode) => void;
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

const Grid = ({
  groups,
  section,
  globals,
  testId,
}: {
  groups: StoryGroup[];
  section: Section;
  globals: FrameGlobals;
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
        />
      </li>
    ))}
  </ul>
);

// The gallery of one section: a live thumbnail per story title under
// `<Section>/`, with the scan's score, status and office, filtered by
// office, status and name. Patterns also lists the stories whose title
// starts with no section, so none of them is out of reach.
const Gallery = ({ section, globals, onMode }: Props) => {
  const all = useStoryGroups();
  const [filter, setFilter] = useState<GalleryFilter>(ALL);
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
    filter.query.trim() !== '';
  const countOf = (status: Status | 'all') =>
    filterGroups(pool, { ...filter, status }).length;
  const set = (patch: Partial<GalleryFilter>) =>
    setFilter((f) => ({ ...f, ...patch }));

  return (
    <article className="wb-page wb-page-wide" data-testid="wb-gallery">
      <header className="wb-page-head wb-page-head-row">
        <div>
          <h1>{copy.title}</h1>
          <p className="wb-lead">{copy.lead}</p>
        </div>
        <div className="wb-head-tools">
          <Segmented
            label="Mode of the previews"
            value={globals.mode}
            options={[
              { value: 'today', label: 'Today' },
              { value: 'redesign', label: 'Redesign' },
            ]}
            onChange={onMode}
            testId="wb-gallery-mode"
          />
        </div>
      </header>

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
            <div className="wb-filter">
              <span className="wb-filter-label">Status</span>
              <Segmented
                label="Status"
                value={filter.status}
                options={STATUSES.filter(
                  (s) =>
                    s.value === 'all' ||
                    s.value === filter.status ||
                    pool.some((g) => g.status === s.value)
                ).map((s) => ({ ...s, count: countOf(s.value) }))}
                onChange={(status) => set({ status })}
                testId="wb-filter-status"
              />
            </div>
          </div>

          <p className="wb-result-count" aria-live="polite">
            {`${shown.length + shownUnfiled.length} of ${pool.length}`}
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

          {shown.length + shownUnfiled.length === 0 && (
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

          {shown.length > 0 && (
            <Grid
              groups={shown}
              section={section}
              globals={globals}
              testId="wb-gallery-grid"
            />
          )}
          {mine.length === 0 && unfiled.length > 0 && (
            <p className="wb-section-note wb-gallery-hint">
              {`No story is titled ${copy.title}/ yet.`}
            </p>
          )}

          {shownUnfiled.length > 0 && (
            <section className="wb-gallery-group">
              <h2 className="wb-section-title">Outside the sections</h2>
              <p className="wb-section-note">
                Stories from app code whose title starts with no section, such
                as <code>Cards/</code> and <code>HomepageBuilder/</code>. They
                show here until they move under Patterns/ or Pages/.
              </p>
              <Grid groups={shownUnfiled} section={section} globals={globals} />
            </section>
          )}
        </>
      )}
    </article>
  );
};

export default Gallery;
