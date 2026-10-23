import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Canvas from '../components/Canvas';
import ChangesDrawer, { InstanceChange } from '../components/ChangesDrawer';
import Icon from '../components/Icon';
import InstanceProps from '../components/InstanceProps';
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
import { HealChoice, HealMode, healModeOf } from '../lib/healTask';
import { pathOf } from '../lib/inspect';
import {
  callSitesOf,
  changeLine,
  INSTANCE_ATTR,
  instanceCount,
  instanceTask,
} from '../lib/instanceProps';
import {
  componentOf,
  decodeReturn,
  openHashes,
  paramOf,
  parsePath,
  parseZoom,
  returnHash,
  storyHash,
  storyOfComponent,
  withParams,
} from '../lib/nesting';
import { useHash } from '../lib/router';
import { groupOfStory, Section, StoryRef } from '../lib/stories';
import { stateKey } from '../lib/storyState';
import { DEFS } from '../lib/tokenValues';
import { useA11yResults } from '../lib/useA11y';
import { Tool, useCanvasSelection } from '../lib/useCanvasSelection';
import { useElementEdits } from '../lib/useElementEdits';
import { useInstanceProps } from '../lib/useInstanceProps';
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
// About three seconds of frames for focus to find its target.
const FOCUS_TRIES = 180;

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

// One story title, laid out like a design tool: the breadcrumbs with Changes
// on their right, in line with the panel's tabs; every state and variant as
// a chip under them; the dotted canvas fills the rest (one mode, or both side
// by side); a bar floats at the foot of the screen for tool, viewport, zoom,
// mode and city; the inspector on the right: Design, A11y, Usage.
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
  const split = view === 'split';
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

  // Where focus goes once the next story is in: the back chip after an
  // open, the layer path after a return.
  const focusNext = useRef<'chip' | 'chain' | null>(null);

  // The page an instance opens, or null: no story, or this page's own.
  const targetOf = useCallback((instance: Element) => {
    const l = latest.current;
    const name = componentOf(instance);
    if (!name || !l.groups) return null;
    const target = storyOfComponent(l.groups, name);
    const here = groupOfStory(l.groups, l.storyId);
    return target && target.group !== here ? target : null;
  }, []);

  // Open the page of the library component `instance` is the root of, the
  // way Figma goes to the main component: this entry keeps the selection
  // (`at`) and zoom, the new one names the way back.
  const open = useCallback(
    (instance: Element, at: Element | null) => {
      const l = latest.current;
      const target = targetOf(instance);
      if (!target) return;
      focusNext.current = 'chip';
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
    },
    [targetOf]
  );
  const pickRef = useRef<(el: Element | null) => void>(() => undefined);
  const onDouble = useCallback(
    (instance: Element) => {
      if (!targetOf(instance)) return;
      pickRef.current(instance);
      open(instance, instance);
    },
    [open, targetOf]
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

  // Back on a pattern: the zoom it was left at. The selection is taken by
  // now (useCanvasSelection reads `sel` first), so both leave the hash: a
  // reload or a copied link starts fresh.
  useEffect(() => {
    const hash = window.location.hash;
    const zoom = parseZoom(paramOf(hash, 'zoom'));
    const l = latest.current;
    if (zoom !== null && zoom !== l.toolbar.zoom) {
      l.setToolbar({ ...l.toolbar, zoom });
    }
    if (paramOf(hash, 'sel') !== null || paramOf(hash, 'zoom') !== null) {
      window.history.replaceState(
        window.history.state,
        '',
        withParams(hash, { sel: null, zoom: null })
      );
    }
  }, [storyId]);

  // Focus follows an open to the back chip instead of falling to the page
  // (the chip shows once the hash with `from` is read).
  useEffect(() => {
    if (focusNext.current !== 'chip') return undefined;
    let tries = 0;
    let raf = 0;
    const attempt = () => {
      const el = document.querySelector<HTMLElement>(
        '[data-testid="wb-back-chip"]'
      );
      if (el) {
        focusNext.current = null;
        el.focus();
      } else if (++tries < FOCUS_TRIES) {
        raf = window.requestAnimationFrame(attempt);
      }
    };
    attempt();
    return () => window.cancelAnimationFrame(raf);
  }, [storyId]);

  // A return focuses the layer path once the pattern's selection is in,
  // not the path the opened component still showed.
  const leftFrom = useRef<Element | null>(null);
  useEffect(() => {
    const el = selection.selected;
    if (focusNext.current !== 'chain' || !el || el === leftFrom.current) {
      return;
    }
    focusNext.current = null;
    document
      .querySelector<HTMLElement>('[data-testid="wb-insp-chain"]')
      ?.focus();
  }, [selection.selected]);
  const {
    edits,
    add: addEdit,
    remove: removeEdit,
    clear: clearEdits,
  } = useElementEdits(TOKEN_META);
  // The frames on screen: one, or both modes side by side.
  const shown = useMemo(
    () => (view === 'split' ? frames : [frames[0]]),
    [view, frames]
  );
  const instances = useInstanceProps(shown, loads, groups);
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
  const layerFrames = useMemo(
    () => (split ? frames : [frames[0]]),
    [split, frames]
  );
  useStoryState(
    layerFrames,
    storyId,
    layerState && layerState !== baseState ? layerState.id : null,
    baseState?.id ?? null,
    loads,
    (id) => {
      window.location.hash = storyHash(section, id, {
        from: paramOf(window.location.hash, 'from'),
      });
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

  // The mode picked in Usage holds for this component; another component
  // starts from its own office.
  const heal = healModeOf(healChoice, group.title, group.office);
  const onHealMode = (mode: HealMode) =>
    setHealChoice({ component: group.title, mode });
  const states = group.stories.filter((s) => s.state);
  const variants = group.stories.filter((s) => !s.state);
  const current = group.stories.find((s) => s.id === storyId);
  // A switch keeps the way back from an open (`from`); a variant keeps the
  // state on top of it, a state story's own state goes on top of the next.
  const go = (id: string, state: string | null = null) => {
    window.location.hash = storyHash(section, id, {
      from: from ? paramOf(hash, 'from') : null,
      state,
    });
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
  const back = from
    ? {
        href: returnHash(from),
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
  const shownFrames = shown;
  const count =
    Object.keys(overrides).length + edits.length + instances.edits.length;
  // The instance properties of the header's instance, by its report.
  const storyName = group.name;
  const instanceExtra = (instance: Element, name: string, self: boolean) => {
    const uid = instance.getAttribute(INSTANCE_ATTR);
    const report =
      instances.report?.storyId === storyId
        ? instances.report.instances.find((i) => i.uid === uid)
        : undefined;
    // The frame has not tagged it: a component without the hook.
    if (!uid) return null;
    return (
      <InstanceProps
        name={name}
        storyName={storyName}
        self={self}
        report={report}
        specs={instances.specs[name]}
        edits={instances.edits.filter(
          (e) =>
            report &&
            e.storyId === storyId &&
            e.component === name &&
            e.index === report.index
        )}
        onSet={(prop, value) => {
          if (!report) return;
          instances.set({
            storyId,
            component: name,
            index: report.index,
            prop,
            value,
            from: report.base[prop],
          });
        }}
        onReset={instances.remove}
      />
    );
  };
  const instanceChanges: InstanceChange[] = instances.edits.map((e, i) => {
    const parent = groupOfStory(groups, e.storyId);
    const parentName = parent?.name ?? e.storyId;
    return {
      edit: e,
      line: changeLine(e, parentName),
      status: instances.statuses[i],
      task: instanceTask(e, {
        storyName: parentName,
        parentFile: parent?.file,
        instances: instanceCount(instances.report, e.storyId, e.component),
        sites:
          indexes.scan && parent?.file
            ? callSitesOf(indexes.scan, parent.file, e.component)
            : [],
      }),
    };
  });
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
      {instances.notice && (
        <div
          className="wb-notice"
          role="alert"
          data-testid="wb-instance-notice"
        >
          <span>{instances.notice}</span>
          <button type="button" onClick={instances.dismiss}>
            Dismiss
          </button>
        </div>
      )}
      {/* The story is the page: the name is for screen readers. */}
      <h1 className="wb-visually-hidden">{group.name}</h1>
      <div className="wb-component-top" data-testid="wb-canvas-bar">
        {back && (
          <a
            className="wb-back-chip"
            data-testid="wb-back-chip"
            href={back.href}
            onClick={(e) => {
              e.preventDefault();
              focusNext.current = 'chain';
              leftFrom.current = selection.selected;
              if (window.history.state?.[OPENED]) {
                window.history.back();
                return;
              }
              // Read now: the hash may have changed since the render.
              const to = decodeReturn(paramOf(window.location.hash, 'from'));
              window.location.hash = to ? returnHash(to) : back.href;
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
          mode={toolbar.mode}
          overrides={overrides}
          onReset={reset}
          onClose={() => setDrawer(false)}
          elements={edits}
          onResetElement={removeEdit}
          onResetElements={clearEdits}
          resolve={(t) => live[toolbar.mode][t] ?? ''}
          task={task}
          instances={instanceChanges}
          onResetInstance={instances.remove}
          onResetInstances={instances.clear}
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
                componentName={group.name}
                frames={shownFrames}
                selection={selection}
                instanceInfo={instanceInfo}
                onOpen={(instance) => open(instance, selection.selected)}
                meta={TOKEN_META}
                mode={toolbar.mode}
                overrides={overrides}
                edits={edits}
                addEdit={addEdit}
                removeEdit={removeEdit}
                findings={findings}
                instanceExtra={instanceExtra}
                revision={instances.revision}
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
