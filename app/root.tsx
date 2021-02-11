import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React, { useEffect } from 'react';
import { render } from 'react-dom';
// tslint:disable-next-line:no-vanilla-routing
import { applyRouterMiddleware, Router, browserHistory } from 'react-router';
import { useScroll } from 'react-router-scroll';
import 'assets/css/reset.min.css';
import 'assets/fonts/fonts.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import App from 'containers/App';
import LanguageProvider from 'containers/LanguageProvider';
import 'file-loader?name=[name].[ext]!./.htaccess';
import createRoutes from './routes';
import { init } from '@sentry/browser';
import OutletsProvider from 'containers/OutletsProvider';
import modules from 'modules';

const rootRoute = {
  component: App,
  childRoutes: createRoutes(),
};

const Root = () => {
  useEffect(() => {
    modules.afterMountApplication();
  }, []);

  return (
    <OutletsProvider>
      <LanguageProvider>
        <Router
          history={browserHistory}
          routes={rootRoute}
          render={applyRouterMiddleware(useScroll())}
        />
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
      environment: process.env.NODE_ENV,
      release: process.env.CIRCLE_BUILD_NUM,
      integrations: [new Integrations.RewriteFrames()],
    });
  });
}
