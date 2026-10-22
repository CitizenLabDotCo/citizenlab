import { useCallback, useMemo, useState } from 'react';

import Nav from './components/Nav';
import Panel, { PanelContext } from './components/Panel';
import { Route, useRoute } from './lib/router';
import Placeholder from './pages/Placeholder';
import StartHere from './pages/StartHere';

const Page = ({ route }: { route: Route }) => {
  switch (route.name) {
    case 'start':
      return <StartHere />;
    case 'foundations':
      return (
        <Placeholder
          title={
            route.category ? `Foundations: ${route.category}` : 'Foundations'
          }
        >
          <p>
            One page per token category: colour, space, radius, font, text,
            shadow, motion, z and focus.
          </p>
        </Placeholder>
      );
    case 'components':
      return (
        <Placeholder
          title={route.storyId ? `Component: ${route.storyId}` : 'Components'}
        >
          {route.storyId && (
            <Panel title="Panels">
              <p className="wb-muted">
                Controls, Tokens, Usage, Accessibility and Docs appear here.
              </p>
            </Panel>
          )}
        </Placeholder>
      );
    case 'patterns':
      return <Placeholder title="Patterns" />;
    case 'pages':
      return <Placeholder title="Pages" />;
    case 'review':
      return <Placeholder title="Review" />;
    case 'proposal':
      return <Placeholder title="Proposal" />;
    case 'not-found':
      return (
        <article className="wb-page">
          <h1>Not found</h1>
          <p>
            There is no page at <code>{route.path}</code>.{' '}
            <a href="#/start">Go to Start here</a>.
          </p>
        </article>
      );
  }
};

const App = () => {
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
  const navName = route.name === 'not-found' ? 'start' : route.name;

  return (
    <PanelContext.Provider value={slot}>
      <div className={panels > 0 ? 'wb-shell wb-shell-with-panel' : 'wb-shell'}>
        <Nav current={navName} />
        <main className="wb-main">
          <Page route={route} />
        </main>
        <aside
          className="wb-panels"
          ref={setPanelEl}
          hidden={panels === 0}
          aria-label="Panels"
        />
      </div>
    </PanelContext.Provider>
  );
};

export default App;
