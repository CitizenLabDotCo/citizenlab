import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Canvas from '../components/Canvas';
import ChangesDrawer from '../components/ChangesDrawer';
import Icon from '../components/Icon';
import PanelTabs from '../components/PanelTabs';
import Segmented from '../components/Segmented';
import {
  CitySetting,
  ToolbarState,
  VIEWPORT_ICONS,
  ZoomControl,
} from '../components/Toolbar';
import { checklistOf } from '../lib/a11y';
import { CHECKLISTS } from '../lib/checklists';
import { fileFindings } from '../lib/componentPanels';
import { resolveTokens } from '../lib/contrast';
import { TOKEN_META } from '../lib/data';
import type { TaskContext } from '../lib/elementEdits';
import { HealChoice, HealMode, healModeOf } from '../lib/healTask';
import { pathOf } from '../lib/inspect';
import {
  componentOf,
  decodeReturn,
  openHashes,
  paramOf,
  parsePath,
  parseZoom,
  returnHash,
  storyOfComponent,
} from '../lib/nesting';
import { useHash } from '../lib/router';
import { groupOfStory, Section, StoryRef } from '../lib/stories';
import { DEFS } from '../lib/tokenValues';
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

type Tab = 'design' | 'a11y' | 'usage';
const TABS: Tab[] = ['design', 'a11y', 'usage'];
const TAB_KEY = 'wb-inspector-tab';

type ModeChoice = 'today' | 'redesign' | 'both';

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

// The history entry an open pushed: Back from the opened component can go
// back to it rather than push the pattern again.
const OPENED = 'wbOpened';

// The selection a return asks for, read when the story comes in.
const restoreSel = () => parsePath(paramOf(window.location.hash, 'sel'));

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

// One story title, laid out like a design tool: the breadcrumbs with the
// mode and Changes on their right, in line with the panel's tabs; the dotted
// canvas fills the rest (one mode, or both side by side); a bar floats at the
// foot of the screen for tool, viewport, zoom and city; the inspector on the
// right: Design, A11y, Usage.
const Component = ({
  section,
  storyId,
  toolbar,
  setToolbar,
  overrides,
  reset,
}: Props) => {
  const groups = useStoryGroups();
  const indexes = useScanIndexes(TOKEN_META);
  const a11y = useA11yResults();
  const [tab, setTab] = useState<Tab>(storedTab);
  const [drawer, setDrawer] = useState(false);
  const [tool, setTool] = useState<Tool>('select');
  const [healChoice, setHealChoice] = useState<HealChoice | undefined>();
  const [view, setView] = useState<View>('single');
  const [frames, setFrames] = useState<(Window | null)[]>([null, null]);
  // A reload in place keeps the frame's window but brings a new document:
  // counted, so what lives in the document is set up again. A story or
  // globals switch keeps both (Canvas); readers key on the story id.
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
  const frame = frames[0];
  const hash = useHash();
  const from = decodeReturn(paramOf(hash, 'from'));
  const latest = useRef({ groups, storyId, section, toolbar, setToolbar });
  latest.current = { groups, storyId, section, toolbar, setToolbar };

  // Open the page of the library component `instance` is the root of, the
  // way Figma goes to the main component: this entry keeps the selection
  // (`at`) and zoom, the new one names the way back.
  const open = useCallback((instance: Element, at: Element | null) => {
    const l = latest.current;
    const name = componentOf(instance);
    if (!name || !l.groups) return;
    const target = storyOfComponent(l.groups, name);
    const here = groupOfStory(l.groups, l.storyId);
    if (!target || target.group === here) return;
    const hashes = openHashes(
      window.location.hash,
      {
        section: l.section,
        storyId: l.storyId,
        path: at ? pathOf(at) : null,
        zoom: l.toolbar.zoom,
      },
      target.storyId
    );
    window.history.replaceState(window.history.state, '', hashes.here);
    window.location.hash = hashes.there;
    window.history.replaceState(
      { ...(window.history.state ?? {}), [OPENED]: true },
      '',
      window.location.hash
    );
  }, []);
  const pickRef = useRef<(el: Element | null) => void>(() => undefined);
  const onDouble = useCallback(
    (instance: Element) => {
      pickRef.current(instance);
      open(instance, instance);
    },
    [open]
  );
  const selection = useCanvasSelection(
    frame,
    loads,
    tool,
    storyId,
    restoreSel,
    onDouble
  );
  pickRef.current = selection.pick;

  // Back on a pattern: the zoom it was left at.
  useEffect(() => {
    const zoom = parseZoom(paramOf(window.location.hash, 'zoom'));
    const l = latest.current;
    if (zoom !== null && zoom !== l.toolbar.zoom) {
      l.setToolbar({ ...l.toolbar, zoom });
    }
  }, [storyId]);
  const {
    edits,
    add: addEdit,
    remove: removeEdit,
    clear: clearEdits,
  } = useElementEdits(TOKEN_META);
  const live = useMemo(() => resolveTokens(DEFS, overrides), [overrides]);
  const fileOf = groups ? groupOfStory(groups, storyId)?.file : undefined;
  const findings = useMemo(
    () => (indexes.scan ? fileFindings(indexes.scan, fileOf) : []),
    [indexes.scan, fileOf]
  );

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
  const back = from
    ? {
        href: returnHash(hash, from),
        name: groupOfStory(groups, from.storyId)?.name ?? from.storyId,
      }
    : null;
  // What the instance header says of a library component.
  const instanceInfo = (name: string) => {
    const target = storyOfComponent(groups, name);
    const scanned = indexes.scan?.components.find((c) => c.component === name);
    return {
      uses: scanned?.usageCount ?? target?.group.score?.usageCount,
      hasStory: !!target,
      self: target?.group === group,
    };
  };
  const shownFrames = split ? frames : [frames[0]];
  const count = Object.keys(overrides).length + edits.length;
  const task: TaskContext = {
    component: group.score?.component ?? group.name,
    file: group.file,
    storyId,
    routes: group.score?.routes ?? [],
    mode: heal,
    layer: selection.label ?? '',
    findings,
  };

  return (
    <article
      className="wb-page wb-page-wide wb-component-page"
      data-testid="wb-component"
    >
      {/* The story is the page: the name is for screen readers. */}
      <h1 className="wb-visually-hidden">{group.name}</h1>
      <div className="wb-component-top" data-testid="wb-canvas-bar">
        {back && (
          <a
            className="wb-back-chip"
            data-testid="wb-back-chip"
            href={back.href}
            onClick={(e) => {
              if (!window.history.state?.[OPENED]) return;
              e.preventDefault();
              window.history.back();
            }}
          >
            <span aria-hidden="true">←</span>
            <span className="wb-visually-hidden">Back to </span>
            {back.name}
          </a>
        )}
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
        <span className="wb-canvas-bar-end">
          <Segmented<ModeChoice>
            label="Mode"
            testId="wb-toolbar-mode"
            value={split ? 'both' : toolbar.mode}
            options={[
              { value: 'today', label: 'Today' },
              { value: 'redesign', label: 'Redesign' },
              {
                value: 'both',
                label: (
                  <>
                    <Icon name="split" size={16} />
                    Both
                  </>
                ),
              },
            ]}
            onChange={(m) => {
              if (m === 'both') setView('split');
              else {
                setView('single');
                if (m !== toolbar.mode) setToolbar({ ...toolbar, mode: m });
              }
            }}
          />
          <button
            type="button"
            className="wb-changes-toggle wb-icon-button"
            data-testid="wb-changes-toggle"
            aria-label="Changes"
            aria-expanded={drawer}
            onClick={() => setDrawer((d) => !d)}
          >
            <Icon name="edit" size={14} />
            <span className={count > 0 ? 'wb-count wb-count-on' : 'wb-count'}>
              {count}
            </span>
          </button>
        </span>
      </div>
      {drawer && (
        <ChangesDrawer
          meta={TOKEN_META}
          mode={toolbar.mode}
          overrides={overrides}
          onReset={reset}
          onClose={() => setDrawer(false)}
          elements={edits}
          onResetElement={removeEdit}
          onResetElements={clearEdits}
          resolve={(t) => live[toolbar.mode][t] ?? ''}
          task={task}
          inline
        />
      )}

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
              elementEdits={edits}
              onFrame={first}
              onScale={setFitScale}
              label="Today"
            />
            <Canvas
              storyId={storyId}
              toolbar={{ ...toolbar, mode: 'redesign' }}
              overrides={overrides}
              elementEdits={edits}
              onFrame={second}
              label="Redesign"
            />
          </>
        ) : (
          <Canvas
            storyId={storyId}
            toolbar={toolbar}
            overrides={overrides}
            elementEdits={edits}
            onFrame={first}
            onScale={setFitScale}
          />
        )}
      </div>
      <div
        className="wb-float-bar"
        role="toolbar"
        aria-label="Canvas"
        data-testid="wb-float-bar"
      >
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
                  <span className="wb-visually-hidden">Select</span>
                </>
              ),
              title: 'Select',
            },
            {
              value: 'interact',
              label: (
                <>
                  <Icon name="hand" size={16} />
                  <span className="wb-visually-hidden">Interact</span>
                </>
              ),
              title: 'Interact',
            },
          ]}
          onChange={setTool}
        />
        <Segmented
          label="Viewport"
          value={toolbar.viewport}
          testId="wb-toolbar-viewport"
          options={VIEWPORT_ICONS.map((v) => ({
            value: v.value,
            label: (
              <>
                <Icon name={v.icon} size={16} />
                <span className="wb-visually-hidden">{v.label}</span>
              </>
            ),
            title: v.label,
          }))}
          onChange={(viewport) => setToolbar({ ...toolbar, viewport })}
        />
        <ZoomControl
          zoom={toolbar.zoom}
          fitScale={fitScale}
          onChange={(zoom) => setToolbar({ ...toolbar, zoom })}
        />
        <CitySetting toolbar={toolbar} setToolbar={setToolbar} />
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
                instanceInfo={instanceInfo}
                onOpen={(instance) => open(instance, selection.selected)}
                keep={from ? { from: paramOf(hash, 'from') } : undefined}
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
            id: 'a11y',
            label: 'A11y',
            icon: 'checklist',
            // The story's axe violations, once loaded.
            count: a11y.loaded
              ? a11y.results?.stories[storyId]?.violations.length
              : undefined,
            content: (
              <div className="wb-inspect" data-testid="wb-panel-inspect">
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
            ),
          },
          {
            id: 'usage',
            label: 'Usage',
            icon: 'usage',
            count: group.score?.usageCount,
            content: (
              <div className="wb-inspect" data-testid="wb-panel-usage">
                <Usage
                  storyId={storyId}
                  group={group}
                  indexes={indexes}
                  healMode={heal}
                  onHealMode={onHealMode}
                />
              </div>
            ),
          },
        ]}
      />
    </article>
  );
};

export default Component;
