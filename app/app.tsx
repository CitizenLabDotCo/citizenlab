import React from 'react';
import ReactDOM from 'react-dom';
// tslint:disable-next-line:no-vanilla-routing
import { applyRouterMiddleware, Router, browserHistory } from 'react-router';
import { useScroll } from 'react-router-scroll';
import Raven from 'raven-js';
import 'utils/lazyImagesObserver';
import App from 'containers/App';
import LanguageProvider from 'containers/LanguageProvider';

// Load the .htaccess file
import 'file-loader?name=[name].[ext]!./.htaccess';

// Import i18n messages
import { translationMessages } from './i18n';

// Import CSS reset and Global Styles
import 'sanitize.css/sanitize.css';
import 'assets/semantic/semantic.min.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './global-styles';

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
      branch: process.env.CIRCLE_BRANCH
    }
  } as any).install();
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
          // Scroll to top when going to a new page, imitating default browser behaviour
          applyRouterMiddleware(useScroll())
        }
      />
    </LanguageProvider>,
    document.getElementById('app')
  );
};

// Hot reloadable translation json files
if ((module as any).hot) {
  (module as any).hot.accept('./i18n', () => render(translationMessages));
}

render(translationMessages);
