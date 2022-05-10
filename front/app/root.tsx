import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React from 'react';
import { render } from 'react-dom';
// tslint:disable-next-line:no-vanilla-routing

import 'assets/css/reset.min.css';
import 'assets/fonts/fonts.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import App from 'containers/App';
import LanguageProvider from 'containers/LanguageProvider';
import createRoutes from './routes';
import { init } from '@sentry/browser';
import OutletsProvider from 'containers/OutletsProvider';
import modules from 'modules';

import {
  unstable_HistoryRouter as HistoryRouter,
  useRoutes,
} from 'react-router-dom';
import historydep from 'history';
console.log({ historydep });
export const history = historydep.createBrowserHistory({ window });
// const Bla = ({children})=>{
//   return children
// }

// const rootRoute = {
//   element: <Bla />,
//   path: "/",
//   children: createRoutes(),
// };

const Routes = () => {
  console.log({ historydep });
  const routes = useRoutes(createRoutes());
  // { path: "team", element: <AboutPage /> },});
  // useEffect(() => {
  //   modules.afterMountApplication();
  // }, []);

  return <App>{routes}</App>;
};
const Root = () => {
  return (
    <OutletsProvider>
      <LanguageProvider>
        <HistoryRouter history={history}>
          <Routes />
        </HistoryRouter>
      </LanguageProvider>
    </OutletsProvider>
  );
};

const mountApplication = () => {
  try {
    modules.beforeMountApplication();
  } finally {
    render(<Root />, document.getElementById('app'));
  }
};

mountApplication();

if (process.env.SENTRY_DSN) {
  import('@sentry/integrations').then((Integrations) => {
    init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENV,
      release: process.env.CIRCLE_BUILD_NUM,
      integrations: [new Integrations.RewriteFrames()],
    });
  });
}
