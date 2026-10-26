import { useCallback, useEffect, useMemo, useState } from 'react';

import Nav from './components/Nav';
import { PanelContext } from './components/Panel';
import { DEFAULT_TOOLBAR, ToolbarState } from './components/Toolbar';
import { TOKEN_META } from './lib/data';
import { LocalContext, LocalStatus, useLocalApi } from './lib/local';
import { useNavCollapsed } from './lib/navCollapsed';
import { Overrides, useOverrides } from './lib/overrides';
import { Route, useRoute } from './lib/router';
import Component from './pages/Component';
import Foundations from './pages/Foundations';
import Gallery from './pages/Gallery';
import Inspect from './pages/Inspect';
import Review from './pages/Review';

type CanvasProps = {
  toolbar: ToolbarState;
  setToolbar: (next: ToolbarState) => void;
  overrides: Overrides;
  setOverride: ReturnType<typeof useOverrides>['setOverride'];
  reset: ReturnType<typeof useOverrides>['reset'];
};

const Page = ({ route, canvas }: { route: Route; canvas: CanvasProps }) => {
  switch (route.name) {
    case 'foundations':
      return (
        <Foundations
          category={route.category}
          token={route.token}
          meta={TOKEN_META}
          overrides={canvas.overrides}
          setOverride={canvas.setOverride}
          reset={canvas.reset}
        />
      );
    case 'components':
    case 'patterns':
    case 'pages':
      return route.storyId ? (
        // No key: opening a component of a pattern (another section) keeps
        // the page, so the canvas switches its frame in place.
        <Component
          section={route.name}
          storyId={route.storyId}
          toolbar={canvas.toolbar}
          setToolbar={canvas.setToolbar}
          overrides={canvas.overrides}
          setOverride={canvas.setOverride}
          reset={canvas.reset}
        />
      ) : (
        <Gallery
          key={route.name}
          section={route.name}
          globals={{
            city: canvas.toolbar.city,
            lang: canvas.toolbar.lang,
          }}
        />
      );
    case 'review':
      return <Review meta={TOKEN_META} overrides={canvas.overrides} />;
    case 'inspect':
      return <Inspect meta={TOKEN_META} />;
    case 'not-found':
      return (
        <article className="wb-page">
          <header className="wb-page-head">
            <h1>Not found</h1>
            <p className="wb-lead">
              There is no page at <code>{route.path}</code>.
            </p>
          </header>
          <a className="wb-button" href="#/components">
            Go to Components
          </a>
        </article>
      );
  }
};

const App = ({ local: localStatus }: { local?: LocalStatus }) => {
  const local = useLocalApi(localStatus);
  const route = useRoute();
  const [panelEl, setPanelEl] = useState<HTMLElement | null>(null);
  const [panels, setPanels] = useState(0);
  const register = useCallback(() => {
    setPanels((n) => n + 1);
    return () => setPanels((n) => n - 1);
  }, []);
  const slot = useMemo(
    () => ({ element: panelEl, register }),
    [panelEl, register]
  );
  const navName = route.name === 'not-found' ? 'components' : route.name;
  const [savedCollapsed, toggleSaved] = useNavCollapsed();
  // Inspect wants the room: the sidebar folds each time it opens and the
  // viewer's own choice is back on leaving. A toggle there lasts the visit.
  const inspecting = route.name === 'inspect';
  const [inspectExpanded, setInspectExpanded] = useState(false);
  useEffect(() => {
    if (inspecting) setInspectExpanded(false);
  }, [inspecting]);
  const navCollapsed = inspecting ? !inspectExpanded : savedCollapsed;
  const toggleNav = inspecting
    ? () => setInspectExpanded((x) => !x)
    : toggleSaved;
  const [toolbar, setToolbar] = useState<ToolbarState>(DEFAULT_TOOLBAR);
  const { overrides, setOverride, reset, notice, dismissNotice } =
    useOverrides(TOKEN_META);

  return (
    <LocalContext.Provider value={local}>
      <PanelContext.Provider value={slot}>
        <div
          className={[
            'wb-shell',
            panels > 0 && 'wb-shell-with-panel',
            navCollapsed && 'wb-shell-nav-collapsed',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <Nav
            current={navName}
            collapsed={navCollapsed}
            onToggleCollapsed={toggleNav}
          />
          <main className="wb-main">
            {notice && (
              <div className="wb-notice" role="alert" data-testid="wb-notice">
                <span>{notice}</span>
                <button type="button" onClick={dismissNotice}>
                  Dismiss
                </button>
              </div>
            )}
            <Page
              route={route}
              canvas={{ toolbar, setToolbar, overrides, setOverride, reset }}
            />
          </main>
          <aside
            className="wb-panels"
            ref={setPanelEl}
            hidden={panels === 0}
            aria-label="Panels"
          />
        </div>
      </PanelContext.Provider>
    </LocalContext.Provider>
  );
};

export default App;
