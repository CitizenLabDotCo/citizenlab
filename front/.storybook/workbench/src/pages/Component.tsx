import { useCallback, useEffect, useRef, useState } from 'react';

import Canvas from '../components/Canvas';
import Icon from '../components/Icon';
import Segmented from '../components/Segmented';
import { OfficeChip, ScoreRing, StatusChip } from '../components/StoryThumb';
import Toolbar, { ToolbarState } from '../components/Toolbar';
import type { Overrides } from '../lib/overrides';
import { groupOfStory, Section, StoryRef } from '../lib/stories';
import { useStoryGroups } from '../lib/useStoryGroups';
import Controls from '../panels/Controls';

type Props = {
  section: Section;
  storyId: string;
  toolbar: ToolbarState;
  setToolbar: (next: ToolbarState) => void;
  overrides: Overrides;
};

type View = 'single' | 'split';

const SECTION_LABEL: Record<Section, string> = {
  components: 'Components',
  patterns: 'Patterns',
  pages: 'Pages',
};

// `LongContent` reads better as "Long content".
const tabLabel = (s: StoryRef) =>
  s.state
    ? s.exportName === 'RTL'
      ? 'RTL'
      : s.exportName
          .replace(/(?<=[a-z])([A-Z])/g, ' $1')
          .replace(/(?<= )[A-Z]/g, (c) => c.toLowerCase())
    : s.name;

type Overflow = 'none' | 'start' | 'end' | 'both';

const overflowOf = (el: HTMLElement): Overflow => {
  const start = el.scrollLeft > 1;
  const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
  return start && end ? 'both' : start ? 'start' : end ? 'end' : 'none';
};

// One row of tabs that scrolls sideways when it is longer than the page,
// with the current tab scrolled into view.
const Tabs = ({
  label,
  stories,
  current,
  section,
}: {
  label: string;
  stories: StoryRef[];
  current: string;
  section: Section;
}) => {
  const list = useRef<HTMLUListElement>(null);
  const [overflow, setOverflow] = useState<Overflow>('none');
  useEffect(() => {
    const el = list.current;
    if (!el) return undefined;
    const update = () => setOverflow(overflowOf(el));
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener('scroll', update, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', update);
    };
  }, []);
  useEffect(() => {
    const el = list.current;
    const tab = el?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!el || !tab) return;
    const left = tab.offsetLeft - el.offsetLeft;
    if (
      left < el.scrollLeft ||
      left + tab.offsetWidth > el.scrollLeft + el.clientWidth
    ) {
      el.scrollLeft = left - el.clientWidth / 2 + tab.offsetWidth / 2;
    }
  }, [current]);
  return (
    <div className="wb-tab-group">
      <span className="wb-tab-group-label">{label}</span>
      <ul
        className="wb-tabs"
        ref={list}
        data-overflow={overflow === 'none' ? undefined : overflow}
      >
        {stories.map((s) => (
          <li key={s.id}>
            <a
              href={`#/${section}/${encodeURIComponent(s.id)}`}
              className="wb-tab"
              aria-current={s.id === current ? 'page' : undefined}
              data-testid="wb-state-tab"
            >
              {tabLabel(s)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

// One story title: its stories as tabs (states first, then variants), the
// canvas alone or today and redesign side by side, and the Controls panel.
const Component = ({
  section,
  storyId,
  toolbar,
  setToolbar,
  overrides,
}: Props) => {
  const groups = useStoryGroups();
  const [view, setView] = useState<View>('single');
  const [frames, setFrames] = useState<(Window | null)[]>([null, null]);
  const onFrame = useCallback(
    (slot: number) => (win: Window | null) =>
      setFrames((f) => {
        if (f[slot] === win) return f;
        const next = [...f];
        next[slot] = win;
        return next;
      }),
    []
  );
  const [first] = useState(() => onFrame(0));
  const [second] = useState(() => onFrame(1));

  if (groups === null) {
    return (
      <article className="wb-page wb-page-wide" aria-busy="true">
        <div className="wb-skeleton-line wb-skeleton-title" />
        <div className="wb-skeleton-block" />
      </article>
    );
  }

  const group = groupOfStory(groups, storyId);
  if (!group) {
    return (
      <article className="wb-page">
        <header className="wb-page-head">
          <h1>Story not found</h1>
          <p className="wb-lead">
            This build has no story <code>{storyId}</code>. It may have been
            renamed.
          </p>
        </header>
        <a className="wb-button" href={`#/${section}`}>
          {`Back to ${SECTION_LABEL[section]}`}
        </a>
      </article>
    );
  }

  const states = group.stories.filter((s) => s.state);
  const variants = group.stories.filter((s) => !s.state);
  const current = group.stories.find((s) => s.id === storyId);
  const split = view === 'split';
  const shownFrames = split ? frames : [frames[0]];

  return (
    <article className="wb-page wb-page-wide" data-testid="wb-component">
      <nav className="wb-crumbs" aria-label="Breadcrumb">
        <a href={`#/${section}`}>{SECTION_LABEL[section]}</a>
        {group.category && (
          <>
            <span aria-hidden="true">/</span>
            <span>{group.category}</span>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span aria-current="page">{group.name}</span>
      </nav>
      <header className="wb-component-head">
        <ScoreRing score={group.score?.score} status={group.status} size={44} />
        <div className="wb-component-title">
          <h1>{group.name}</h1>
          <div className="wb-chip-row">
            <StatusChip status={group.status} />
            <OfficeChip office={group.office} />
            {group.score && (
              <span className="wb-chip wb-chip-office">
                {`Used ${group.score.usageCount} times`}
              </span>
            )}
            {group.file && (
              <span className="wb-component-file" title={group.file}>
                <Icon name="file" size={14} />
                <code>{group.file}</code>
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="wb-story-tabs" aria-label="Stories" role="navigation">
        {states.length > 0 && (
          <Tabs
            label="States"
            stories={states}
            current={storyId}
            section={section}
          />
        )}
        {variants.length > 0 && (
          <Tabs
            label={states.length > 0 ? 'Variants' : 'Stories'}
            stories={variants}
            current={storyId}
            section={section}
          />
        )}
      </div>

      <Toolbar
        value={toolbar}
        onChange={setToolbar}
        modeLocked={split ? 'Both modes are shown side by side.' : undefined}
      >
        <Segmented<View>
          label="View"
          value={view}
          options={[
            {
              value: 'single',
              label: (
                <>
                  <Icon name="single" size={16} />
                  Single
                </>
              ),
            },
            {
              value: 'split',
              label: (
                <>
                  <Icon name="split" size={16} />
                  Today | Redesign
                </>
              ),
              title: 'Today and redesign side by side',
            },
          ]}
          onChange={setView}
          testId="wb-view"
        />
      </Toolbar>

      <div
        className={split ? 'wb-stage wb-stage-split' : 'wb-stage'}
        data-testid="wb-stage"
      >
        {split ? (
          <>
            <Canvas
              storyId={storyId}
              toolbar={{ ...toolbar, mode: 'today' }}
              overrides={overrides}
              onFrame={first}
              label="Today"
            />
            <Canvas
              storyId={storyId}
              toolbar={{ ...toolbar, mode: 'redesign' }}
              overrides={overrides}
              onFrame={second}
              label="Redesign"
            />
          </>
        ) : (
          <Canvas
            storyId={storyId}
            toolbar={toolbar}
            overrides={overrides}
            onFrame={first}
            label={current ? tabLabel(current) : undefined}
          />
        )}
      </div>

      <Controls storyId={storyId} frames={shownFrames} />
    </article>
  );
};

export default Component;
