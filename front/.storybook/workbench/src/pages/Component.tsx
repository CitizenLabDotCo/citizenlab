import { useCallback, useEffect, useMemo, useState } from 'react';

import Canvas from '../components/Canvas';
import Icon from '../components/Icon';
import PanelTabs from '../components/PanelTabs';
import Segmented from '../components/Segmented';
import { OfficeChip, ScoreRing, StatusChip } from '../components/StoryThumb';
import { ToolbarState, ZoomControl } from '../components/Toolbar';
import { checklistOf } from '../lib/a11y';
import { CHECKLISTS } from '../lib/checklists';
import { fileFindings } from '../lib/componentPanels';
import { TOKEN_META } from '../lib/data';
import { HealChoice, HealMode, healModeOf } from '../lib/healTask';
import { channelOf, storyLangOf } from '../lib/preview';
import { groupOfStory, Section, StoryRef } from '../lib/stories';
import { useA11yResults } from '../lib/useA11y';
import { Tool, useCanvasSelection } from '../lib/useCanvasSelection';
import { useElementEdits } from '../lib/useElementEdits';
import { useScanIndexes } from '../lib/useScanIndexes';
import { useStoryGroups } from '../lib/useStoryGroups';
import A11y from '../panels/A11y';
import Design from '../panels/Design';
import Usage from '../panels/Usage';

import type { Overrides } from '../lib/overrides';
import type { TokenName } from '@ds/tokens/tokens';

type Props = {
  section: Section;
  storyId: string;
  toolbar: ToolbarState;
  setToolbar: (next: ToolbarState) => void;
  overrides: Overrides;
  setOverride: (name: TokenName, value: string) => string | undefined;
  reset: (name?: TokenName) => void;
};

type View = 'single' | 'split';

type Tab = 'design' | 'inspect';
const TABS: Tab[] = ['design', 'inspect'];
const TAB_KEY = 'wb-inspector-tab';

// The Inspect tab's own views.
type Detail = 'usage' | 'a11y';

// The last panel tab, per browser (storage may be blocked).
const storedTab = (): Tab => {
  try {
    const t = window.localStorage.getItem(TAB_KEY) as Tab | null;
    return t && TABS.includes(t) ? t : 'design';
  } catch {
    return 'design';
  }
};
const storeTab = (t: Tab) => {
  try {
    window.localStorage.setItem(TAB_KEY, t);
  } catch {
    // Not kept; the tab still switches.
  }
};

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

// One story title, laid out like a design tool: the canvas in the middle
// (alone, or today and redesign side by side) and the inspector on the
// right. Design holds the story, the canvas settings, the selected
// element's tokens and the props; Inspect holds the token list with its
// heal, the usage and the a11y checks.
const Component = ({
  section,
  storyId,
  toolbar,
  setToolbar,
  overrides,
  // Task 10 puts the Changes drawer (reset) and the language field
  // (storyLang) on the canvas bar.
  reset: _reset,
}: Props) => {
  const groups = useStoryGroups();
  const indexes = useScanIndexes(TOKEN_META);
  const a11y = useA11yResults();
  const [tab, setTab] = useState<Tab>(storedTab);
  const [detail, setDetail] = useState<Detail>('usage');
  const [tool, setTool] = useState<Tool>('select');
  const [healChoice, setHealChoice] = useState<HealChoice | undefined>();
  const [view, setView] = useState<View>('single');
  const [frames, setFrames] = useState<(Window | null)[]>([null, null]);
  // A reload in place keeps the frame's window but brings a new document:
  // counted, so what lives in the document is set up again.
  const [loads, setLoads] = useState(0);
  const onFrame = useCallback(
    (slot: number) => (win: Window | null) => {
      if (slot === 0 && win) setLoads((n) => n + 1);
      setFrames((f) => {
        if (f[slot] === win) return f;
        const next = [...f];
        next[slot] = win;
        return next;
      });
    },
    []
  );
  const [first] = useState(() => onFrame(0));
  const [second] = useState(() => onFrame(1));
  const [fitScale, setFitScale] = useState<number | undefined>();
  // The language the story sets itself, read after each render.
  const [_storyLang, setStoryLang] = useState<string | undefined>();
  const frame = frames[0];
  const selection = useCanvasSelection(frame, loads, tool, storyId);
  const {
    edits,
    add: addEdit,
    remove: removeEdit,
  } = useElementEdits(TOKEN_META);
  const fileOf = groups ? groupOfStory(groups, storyId)?.file : undefined;
  const findings = useMemo(
    () => (indexes.scan ? fileFindings(indexes.scan, fileOf) : []),
    [indexes.scan, fileOf]
  );
  useEffect(() => {
    const read = () => setStoryLang(storyLangOf(frame));
    read();
    const channel = channelOf(frame);
    channel?.on('storyRendered', read);
    return () => channel?.off('storyRendered', read);
  }, [frame, loads]);

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

  // The mode picked in Usage holds for this component; another component
  // starts from its own office.
  const heal = healModeOf(healChoice, group.title, group.office);
  const onHealMode = (mode: HealMode) =>
    setHealChoice({ component: group.title, mode });
  const states = group.stories.filter((s) => s.state);
  const variants = group.stories.filter((s) => !s.state);
  const current = group.stories.find((s) => s.id === storyId);
  const split = view === 'split';
  const shownFrames = split ? frames : [frames[0]];

  return (
    <article
      className="wb-page wb-page-wide wb-component-page"
      data-testid="wb-component"
    >
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

      <div className="wb-canvas-bar" data-testid="wb-canvas-bar">
        <Segmented<Tool>
          label="Tool"
          value={tool}
          testId="wb-tool"
          options={[
            {
              value: 'select',
              label: (
                <>
                  <Icon name="pointer" size={16} />
                  Select
                </>
              ),
              title: 'Click an element to see its tokens',
            },
            {
              value: 'interact',
              label: (
                <>
                  <Icon name="hand" size={16} />
                  Interact
                </>
              ),
              title: 'Use the story: clicks reach it',
            },
          ]}
          onChange={setTool}
        />
        <span className="wb-canvas-bar-end">
          <ZoomControl
            zoom={toolbar.zoom}
            fitScale={fitScale}
            onChange={(zoom) => setToolbar({ ...toolbar, zoom })}
          />
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
                    Side by side
                  </>
                ),
                title: 'Today and redesign side by side',
              },
            ]}
            onChange={setView}
            testId="wb-view"
          />
        </span>
      </div>

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
              onScale={setFitScale}
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
            onScale={setFitScale}
            label={current ? tabLabel(current) : undefined}
          />
        )}
      </div>

      <PanelTabs<Tab>
        title="Inspector"
        value={tab}
        onChange={(t) => {
          setTab(t);
          storeTab(t);
        }}
        tabs={[
          {
            id: 'design',
            label: 'Design',
            icon: 'sliders',
            content: (
              <Design
                section={section}
                storyId={storyId}
                states={states}
                variants={variants}
                tabLabel={tabLabel}
                componentName={group.name}
                frames={shownFrames}
                selection={selection}
                meta={TOKEN_META}
                mode={toolbar.mode}
                overrides={overrides}
                edits={edits}
                addEdit={addEdit}
                removeEdit={removeEdit}
                findings={findings}
              />
            ),
          },
          {
            id: 'inspect',
            label: 'Inspect',
            icon: 'tokens',
            content: (
              <div className="wb-inspect" data-testid="wb-panel-inspect">
                <Segmented<Detail>
                  label="Inspect"
                  value={detail}
                  onChange={setDetail}
                  testId="wb-inspect-view"
                  options={[
                    {
                      value: 'usage',
                      label: 'Usage',
                      count: group.score?.usageCount,
                    },
                    {
                      value: 'a11y',
                      label: 'A11y',
                      // The story's axe violations, once loaded.
                      count: a11y.loaded
                        ? a11y.results?.stories[storyId]?.violations.length
                        : undefined,
                    },
                  ]}
                />
                <div hidden={detail !== 'usage'}>
                  <Usage
                    storyId={storyId}
                    group={group}
                    indexes={indexes}
                    healMode={heal}
                    onHealMode={onHealMode}
                  />
                </div>
                <div hidden={detail !== 'a11y'}>
                  <A11y
                    storyId={storyId}
                    storyLabel={current ? tabLabel(current) : undefined}
                    group={group}
                    section={section}
                    results={a11y.results}
                    loaded={a11y.loaded}
                    checklist={checklistOf(CHECKLISTS, group)}
                  />
                </div>
              </div>
            ),
          },
        ]}
      />
    </article>
  );
};

export default Component;
