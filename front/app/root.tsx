import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React from 'react';
import { render } from 'react-dom';
// tslint:disable-next-line:no-vanilla-routing
import { BrowserRouter, useRoutes } from 'react-router-dom';

import 'assets/css/reset.min.css';
import 'assets/fonts/fonts.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
// import App from 'containers/App';
// import LanguageProvider from 'containers/LanguageProvider';
// import createRoutes from './routes';
import { init } from '@sentry/browser';
import OutletsProvider from 'containers/OutletsProvider';
import modules from 'modules';

// const rootRoute = {
//   component: App,
//   childRoutes: createRoutes(),
// };

const Routes = () => {
  const routes = useRoutes([
    {
      path: '/',
      element: <div>dashboard</div>,
      // children: [
      //   {
      //     path: "messages",
      //     element: <DashboardMessages />,
      //   },
      //   { path: "tasks", element: <DashboardTasks /> },
      // ],
    },
  ]);
  // { path: "team", element: <AboutPage /> },});
  // useEffect(() => {
  //   modules.afterMountApplication();
  // }, []);

  return routes;
};
const Root = () => {
  return (
    <OutletsProvider>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
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
