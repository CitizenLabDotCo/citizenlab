import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React from 'react';
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
import useTenant from 'hooks/useTenant';
import useLocale from 'hooks/useLocale';
import OutletsProvider from 'containers/OutletsProvider';
import { isNilOrError } from 'utils/helperUtils';

const rootRoute = {
  component: App,
  childRoutes: createRoutes(),
};

const Root = () => {
  const tenant = useTenant();
  const locale = useLocale();
  const wasUrl = 'https://www.was.digst.dk/hillerod-citizenlab-co-da-DK';

  if (!isNilOrError(tenant) && !isNilOrError(locale)) {
    const wasUrlRequest = window.location.pathname === `/${locale}/was`;

    if (wasUrl && wasUrlRequest) {
      window.location.replace(wasUrl);
    }

    if (
      tenant.data.attributes.settings.core.lifecycle_stage === 'expired_trial'
    ) {
      window.location.href = 'https://www.citizenlab.co/expired-trial';
    }

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
  }

  return null;
};

render(<Root />, document.getElementById('app'));

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
