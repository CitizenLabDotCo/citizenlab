import '@babel/polyfill';
import React from 'react';
import { render } from 'react-dom';
// tslint:disable-next-line:no-vanilla-routing
import { applyRouterMiddleware, Router, browserHistory } from 'react-router';
import { useScroll } from 'react-router-scroll';
import 'utils/lazyImagesObserver';
import App from 'containers/App';
import LanguageProvider from 'containers/LanguageProvider';
import { init } from '@sentry/browser';

// Load the .htaccess file
import 'file-loader?name=[name].[ext]!./.htaccess';

// Import i18n messages
import { translationMessages } from './i18n';

// Import CSS reset and Global Styles
import 'assets/css/reset.min.css';
import './global-styles';

// Import root routes
import createRoutes from './routes';

import { initializeAnalytics } from 'utils/analytics';

if (process && process.env && process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  // configureScope((scope) => {
  //   scope.setTag('git_commit', process.env.CIRCLE_SHA1 as string);
  //   scope.setTag('branch', process.env.CIRCLE_BRANCH as string);
  // });

  init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.CIRCLE_BUILD_NUM
  });
}

initializeAnalytics();

const rootRoute = {
  component: App,
  childRoutes: createRoutes(),
};

const Root = () => (
  <LanguageProvider messages={translationMessages}>
    <Router
      history={browserHistory}
      routes={rootRoute}
      render={applyRouterMiddleware(useScroll())}
    />
  </LanguageProvider>
);

render(<Root />, document.getElementById('app'));
