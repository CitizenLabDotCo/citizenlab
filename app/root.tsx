import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React from 'react';
import { render } from 'react-dom';
// tslint:disable-next-line:no-vanilla-routing
import { applyRouterMiddleware, Router, browserHistory } from 'react-router';
import { useScroll } from 'react-router-scroll';
import 'assets/css/reset.min.css';
import 'assets/fonts/fonts.css';
import App from 'containers/App';
import LanguageProvider from 'containers/LanguageProvider';
import 'file-loader?name=[name].[ext]!./.htaccess';
import createRoutes from './routes';
import { initializeAnalytics } from 'utils/analytics';
import { init } from '@sentry/browser';

const rootRoute = {
  component: App,
  childRoutes: createRoutes(),
};

const Root = () => {
  return (
    <LanguageProvider>
      <Router
        history={browserHistory}
        routes={rootRoute}
        render={applyRouterMiddleware(useScroll())}
      />
    </LanguageProvider>
  );
};

render(<Root />, document.getElementById('app'));

// if (process.env.NODE_ENV !== 'development') {
//   import('offline-plugin/runtime').then((OfflinePlugin) => {
//     OfflinePlugin.install();
//   });
// }

if (process.env.NODE_ENV === 'production') {
  initializeAnalytics();

  import('@sentry/integrations').then((Integrations) => {
    init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: process.env.CIRCLE_BUILD_NUM,
      integrations: [
        new Integrations.RewriteFrames()
      ]
    });
  });
}
