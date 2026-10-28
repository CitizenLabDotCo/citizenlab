import { useCallback, useEffect, useMemo, useState } from 'react';

import Canvas from '../components/Canvas';
import ChangesDrawer from '../components/ChangesDrawer';
import Icon from '../components/Icon';
import PanelTabs from '../components/PanelTabs';
import Segmented from '../components/Segmented';
import StoryChips from '../components/StoryChips';
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
import { paramOf, storyHash } from '../lib/hash';
import { useHash } from '../lib/router';
import { groupOfStory, Section, StoryRef } from '../lib/stories';
import { stateKey } from '../lib/storyState';
import { DEFS } from '../lib/tokenValues';
import { useA11yResults } from '../lib/useA11y';
import { Tool, useCanvasSelection } from '../lib/useCanvasSelection';
import { useElementEdits } from '../lib/useElementEdits';
import { useScanIndexes } from '../lib/useScanIndexes';
import { useStoryState } from '../lib/useStoryState';
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

type Tab = 'design' | 'a11y' | 'usage';
const TABS: Tab[] = ['design', 'a11y', 'usage'];
const TAB_KEY = 'wb-inspector-tab';

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

// One story title, laid out like a design tool: the breadcrumbs with Changes
// on their right, in line with the panel's tabs; every state and variant as
// a chip under them; the dotted canvas fills the rest; a bar floats at the
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
  // The scan (the biggest file) waits for the canvas to load, at most 10 s:
  // on a slow link the story gets the bandwidth first. The groups come from
  // index.json meanwhile.
  const [scanHeld, setScanHeld] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setScanHeld(false), 10000);
    return () => window.clearTimeout(t);
  }, []);
  const groups = useStoryGroups({ early: true, hold: scanHeld });
  const indexes = useScanIndexes(TOKEN_META, false, scanHeld);
  const a11y = useA11yResults();
  const [tab, setTab] = useState<Tab>(storedTab);
  const [drawer, setDrawer] = useState(false);
  const [tool, setTool] = useState<Tool>('select');
  const [frame, setFrame] = useState<Window | null>(null);
  // A reload in place keeps the frame's window but brings a new document:
  // counted, so what lives in the document is set up again. A story or
  // globals switch keeps both (Canvas); readers key on the story id.
  const [loads, setLoads] = useState(0);
  const onFrame = useCallback((win: Window | null) => {
    if (win) {
      setLoads((n) => n + 1);
      setScanHeld(false);
    }
    setFrame(win);
  }, []);
  const [fitScale, setFitScale] = useState<number | undefined>();
  const frames = useMemo(() => [frame], [frame]);
  const hash = useHash();

  const {
    edits,
    add: addEdit,
    remove: removeEdit,
    clear: clearEdits,
  } = useElementEdits(TOKEN_META);
  const selection = useCanvasSelection(frame, loads, tool, storyId);
  const live = useMemo(() => resolveTokens(DEFS, overrides), [overrides]);
  const fileOf = groups ? groupOfStory(groups, storyId)?.file : undefined;
  // A state on top of a variant (`state` in the hash): Primary and Disabled.
  const own = groups ? groupOfStory(groups, storyId) : undefined;
  const ownStates = own?.stories.filter((s) => s.state) ?? [];
  const layered =
    !!own?.stories.find((s) => s.id === storyId && !s.state) &&
    ownStates.length > 0;
  const stateParam = paramOf(hash, 'state');
  const layerState = layered
    ? ownStates.find((s) => stateKey(s.id) === stateParam)
    : undefined;
  const baseState =
    ownStates.find((s) => s.exportName === 'Default') ?? ownStates[0];
  useStoryState(
    frames,
    storyId,
    layerState && layerState !== baseState ? layerState.id : null,
    baseState?.id ?? null,
    loads,
    (id) => {
      window.location.hash = storyHash(section, id);
    }
  );
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

  const states = group.stories.filter((s) => s.state);
  const variants = group.stories.filter((s) => !s.state);
  const current = group.stories.find((s) => s.id === storyId);
  // A variant keeps the state on top of it, a state story's own state goes
  // on top of the next.
  const go = (id: string, state: string | null = null) => {
    window.location.hash = storyHash(section, id, { state });
  };
  const stateNow = layered
    ? layerState ?? baseState
    : current?.state
    ? current
    : undefined;
  const onState = (id: string) => {
    if (!layered) go(id);
    else go(storyId, id === baseState?.id ? null : stateKey(id));
  };
  const onVariant = (id: string) =>
    go(id, stateNow && stateNow !== baseState ? stateKey(stateNow.id) : null);
  const count = Object.keys(overrides).length + edits.length;
  const task: TaskContext = {
    component: group.score?.component ?? group.name,
    file: group.file,
    storyId,
    routes: group.score?.routes ?? [],
    layer: selection.label ?? '',
  };

  return (
    <article
      className="wb-page wb-page-wide wb-component-page"
      data-testid="wb-component"
    >
      {/* The story is the page: the name is for screen readers. */}
      <h1 className="wb-visually-hidden">{group.name}</h1>
      <div className="wb-component-top" data-testid="wb-canvas-bar">
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
      {(states.length > 0 || variants.length > 0) && (
        <div className="wb-story-strip" data-testid="wb-insp-story">
          {variants.length > 0 && (
            <StoryChips
              id="variant"
              label={states.length > 0 ? 'Variant' : 'Story'}
              stories={variants}
              value={storyId}
              tabLabel={tabLabel}
              onChange={states.length > 0 ? onVariant : go}
            />
          )}
          {states.length > 0 && (
            <StoryChips
              id="state"
              label="State"
              stories={states}
              value={stateNow?.id ?? ''}
              tabLabel={tabLabel}
              onChange={onState}
            />
          )}
        </div>
      )}
      {drawer && (
        <ChangesDrawer
          meta={TOKEN_META}
          overrides={overrides}
          onReset={reset}
          onClose={() => setDrawer(false)}
          elements={edits}
          onResetElement={removeEdit}
          onResetElements={clearEdits}
          resolve={(t) => live[t] ?? ''}
          task={task}
          inline
        />
      )}

      <div className="wb-stage" data-testid="wb-stage">
        <Canvas
          storyId={storyId}
          toolbar={toolbar}
          overrides={overrides}
          elementEdits={edits}
          onFrame={onFrame}
          onScale={setFitScale}
        />
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
                storyId={storyId}
                frames={frames}
                selection={selection}
                meta={TOKEN_META}
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
                <Usage storyId={storyId} group={group} indexes={indexes} />
              </div>
            ),
          },
        ]}
      />
    </article>
  );
};

export default Component;
