/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

// Needed for redux-saga es6 generator support
import 'babel-polyfill';

// Import all the third party stuff
import React from 'react';
import ReactDOM from 'react-dom';
import { applyRouterMiddleware, Router, browserHistory } from 'react-router';
import { useScroll } from 'react-router-scroll';
import Raven from 'raven-js';

// Creates the LazyImages Observer
import 'utils/lazyImagesObserver';

// Import root app
import App from 'containers/App';

// Import Language Provider
import LanguageProvider from 'containers/LanguageProvider';

// Load the favicon, the manifest.json file and the .htaccess file
/* eslint-disable import/no-unresolved, import/extensions */
import '!file-loader?name=[name].[ext]!./favicon.ico';
import '!file-loader?name=[name].[ext]!./manifest.json';
import 'file-loader?name=[name].[ext]!./.htaccess';
/* eslint-enable import/no-unresolved, import/extensions */

// Import i18n messages
import { translationMessages } from './i18n';

/* eslint-disable import/first */
// Import CSS reset and Global Styles
// import '../vendor/foundation/main.scss';
import 'sanitize.css/sanitize.css';
import 'semantic-ui-css/semantic.css';
import 'react-select/dist/react-select.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './global-styles';
/* eslint-enable import/first */

// Import root routes
import createRoutes from './routes';

import { initializeAnalytics } from 'utils/analytics';

// Sentry error tracking
if (process.env.NODE_ENV !== 'development' && process.env.SENTRY_DSN) {
  Raven.config(process.env.SENTRY_DSN, {
    environment: process.env.NODE_ENV,
    release: process.env.CIRCLE_BUILD_NUM,
    tags: {
      git_commit: process.env.CIRCLE_SHA1,
      branch: process.env.CIRCLE_BRANCH,
    },
  }).install();
}

initializeAnalytics();

// Set up the router, wrapping all Routes in the App component
const rootRoute = {
  component: App,
  childRoutes: createRoutes(),
};

const render = (messages) => {
  ReactDOM.render(
    <LanguageProvider messages={messages}>
      <Router
        history={browserHistory}
        routes={rootRoute}
        render={
          // Scroll to top when going to a new page, imitating default browser
          // behaviour
          applyRouterMiddleware(useScroll())
        }
      />
    </LanguageProvider>,
    document.getElementById('app')
  );
};

// Hot reloadable translation json files
if (module.hot) {
  // modules.hot.accept does not accept dynamic dependencies,
  // have to be constants at compile-time
  module.hot.accept('./i18n', () => {
    render(translationMessages);
  });
}

render(translationMessages);
