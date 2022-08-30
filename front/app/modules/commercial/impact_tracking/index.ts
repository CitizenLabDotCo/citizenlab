import { events$, pageChanges$, tenantInfo } from 'utils/analytics';
import { currentAppConfigurationStream } from 'services/appConfiguration';
import { authUserStream } from 'services/auth';
import { withLatestFrom } from 'rxjs';
import { ModuleConfiguration } from 'utils/moduleUtils';

const trackEvent = (_payload) => {
  // console.log(payload);
};

const trackPageChange = (_payload) => {
  // console.log(payload);
};

const configuration: ModuleConfiguration = {
  beforeMountApplication: () => {
    pageChanges$
      .pipe(
        withLatestFrom(
          authUserStream().observable,
          currentAppConfigurationStream().observable
        )
      )
      .subscribe(([pageChange, user, appConfig]) => {
        trackPageChange({
          path: pageChange.path,
          url: `https://${appConfig.data.attributes.host}${pageChange.path}`,
          title: document.title,
          user_id: user?.data.id,
          properties: pageChange.properties,
          ...tenantInfo(appConfig.data),
        });
      });

    events$
      .pipe(
        withLatestFrom(
          authUserStream().observable,
          currentAppConfigurationStream().observable
        )
      )
      .subscribe(([event, user, appConfig]) => {
        trackEvent({
          name: event.name,
          properties: event.properties,
          user_id: user?.data.id,
          ...tenantInfo(appConfig.data),
        });
      });
  },
};

export default configuration;
