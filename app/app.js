/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

// debug utils
import { cl } from 'utils/debugUtils'; // eslint-disable-line

// Sentry error tracking
if (process.env.NODE_ENV !== 'development') {
  if (window.Raven) {
    window.Raven.config('https://7cc28cd69e544a9f9c1a5295cb359fb1@sentry.io/224810', {
      environment: process.env.NODE_ENV,
    }).install();
  }
}


// Needed for redux-saga es6 generator support
import 'babel-polyfill';

// Import all the third party stuff
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyRouterMiddleware, Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import FontFaceObserver from 'fontfaceobserver';
import { useScroll } from 'react-router-scroll';
import 'sanitize.css/sanitize.css';
import 'react-select/dist/react-select.css';
import { fromJS } from 'immutable';

// add reactMap to immutible
import 'utils/immutablePatch';

import { Sagas } from 'utils/react-redux-saga';

// Import root app
import App from 'containers/App';

// Import selector for `syncHistoryWithStore`
import { makeSelectLocationState } from 'containers/App/selectors';

// Import Language Provider
import LanguageProvider from 'containers/LanguageProvider';

// Load the favicon, the manifest.json file and the .htaccess file
/* eslint-disable import/no-unresolved, import/extensions */
import '!file-loader?name=[name].[ext]!./favicon.ico';
import '!file-loader?name=[name].[ext]!./manifest.json';
import 'file-loader?name=[name].[ext]!./.htaccess';
/* eslint-enable import/no-unresolved, import/extensions */

import configureStore, { getSagaMiddleware } from './store';

// Import i18n messages
import { translationMessages } from './i18n';

/* eslint-disable import/first */
// Import CSS reset and Global Styles
// import '../vendor/foundation/main.scss';
import 'semantic-ui-css/semantic.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './global-styles';

/* eslint-enable import/first */

// Import root routes
import createRoutes from './routes';

import { loadState } from './persistedData';

import { initializeAnalytics } from 'utils/analytics';

// Observe loading of custom font
const visuelt = new FontFaceObserver('visuelt');

// When custom font is loaded, add a 'fontLoaded' class to the body tag
visuelt.load().then(() => {
  document.body.classList.add('fontLoaded');
}, () => {
  document.body.classList.remove('fontLoaded');
});

// Create redux store with history
// this uses the singleton browserHistory provided by react-router
// Optionally, this could be changed to leverage a created history
// e.g. `const browserHistory = useRouterHistory(createBrowserHistory)();`

const initialState = fromJS({
  persistedData: loadState(),
});

export const store = configureStore(initialState, browserHistory);

// The sagas for analytics tracking need to be mounted here,
// because they need to be able to watch the very first events
// like initial route change, authenitcation
initializeAnalytics(store);

// Sync history and store, as the react-router-redux reducer
// is under the non-default key ("routing"), selectLocationState
// must be provided for resolving how to retrieve the "route" in the state
const history = syncHistoryWithStore(browserHistory, store, {
  selectLocationState: makeSelectLocationState(),
});

// Set up the router, wrapping all Routes in the App component
const rootRoute = {
  component: App,
  childRoutes: createRoutes(store),
};

const render = (messages) => {
  ReactDOM.render(
    <Provider store={store}>
      <Sagas middleware={getSagaMiddleware()}>
        <LanguageProvider messages={messages}>
          <Router
            history={history}
            routes={rootRoute}
            render={
              // Scroll to top when going to a new page, imitating default browser
              // behaviour
              applyRouterMiddleware(useScroll())
            }
          />
        </LanguageProvider>
      </Sagas>
    </Provider>,
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

// Chunked polyfill for browsers without Intl support
if (!window.Intl) {
  (new Promise((resolve) => {
    resolve(import('intl'));
  }))
    .then(() => Promise.all([
      import('intl/locale-data/jsonp/en.js'),
    ]))
    .then(() => render(translationMessages))
    .catch((err) => {
      throw err;
    });
} else {
  render(translationMessages);
}
