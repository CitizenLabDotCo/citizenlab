import {
  IDestinationConfig,
  registerDestination,
} from 'components/ConsentManager/destinations';
import {
  bufferUntilInitialized,
  events$,
  initializeFor,
  pageChanges$,
  tenantInfo,
} from 'utils/analytics';
import snippet from '@segment/snippet';
import { currentAppConfigurationStream } from 'services/appConfiguration';
import { authUserStream } from 'services/auth';
import { combineLatest } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';
import { get, isFunction } from 'lodash-es';
import { IUser } from 'services/users';
import {
  isAdmin,
  isProjectModerator,
  isSuperAdmin,
} from 'services/permissions/roles';
import { ModuleConfiguration } from 'utils/moduleUtils';

export const CL_SEGMENT_API_KEY =
  process.env.SEGMENT_API_KEY || 'sIoYsVoTTCBmrcs7yAz1zRFRGhAofBlg';

declare module 'components/ConsentManager/destinations' {
  export interface IDestinationMap {
    segment: 'segment';
  }
}

const destinationConfig: IDestinationConfig = {
  key: 'segment',
  category: 'analytics',
  feature_flag: 'segment',
  name: (tenant) => {
    const destinations = tenant.attributes.settings.segment?.destinations;
    return `Segment${destinations ? ` (${destinations})` : ''}`;
  },
};

const integrations = (user: IUser | null) => {
  const output = {
    Intercom: false,
    SatisMeter: false,
  };

  if (user) {
    const highestRole = user.data.attributes.highest_role;
    output['Intercom'] =
      highestRole === 'admin' || highestRole === 'project_moderator';
    output['SatisMeter'] =
      highestRole === 'admin' || highestRole === 'project_moderator';
  }
  return output;
};

const configuration: ModuleConfiguration = {
  beforeMountApplication: () => {
    initializeFor('segment').subscribe(() => {
      const code = snippet.min({
        host: 'cdn.segment.com',
        load: true,
        page: false,
        apiKey: CL_SEGMENT_API_KEY,
      });

      // tslint:disable-next-line: no-eval
      eval(code);
    });

    combineLatest([
      currentAppConfigurationStream().observable,
      bufferUntilInitialized('segment', authUserStream().observable),
    ]).subscribe(([tenant, user]) => {
      if (
        !isNilOrError(tenant) &&
        isFunction(get(window, 'analytics.identify')) &&
        isFunction(get(window, 'analytics.group'))
      ) {
        if (user) {
          analytics.identify(
            user.data.id,
            {
              ...tenantInfo(tenant.data),
              email: user.data.attributes.email,
              firstName: user.data.attributes.first_name,
              lastName: user.data.attributes.last_name,
              createdAt: user.data.attributes.created_at,
              avatar: user.data.attributes.avatar
                ? user.data.attributes.avatar.large
                : null,
              birthday: user.data.attributes.birthyear,
              gender: user.data.attributes.gender,
              locale: user.data.attributes.locale,
              isSuperAdmin: isSuperAdmin(user),
              isAdmin: isAdmin(user),
              isProjectModerator: isProjectModerator(user),
              highestRole: user.data.attributes.highest_role,
            },
            {
              integrations: integrations(user),
              Intercom: { hideDefaultLauncher: !isAdmin(user) },
            } as any
          );
          analytics.group(
            tenant.data.id,
            {
              ...tenantInfo(tenant.data),
              name: tenant.data.attributes.name,
              website: tenant.data.attributes.settings.core.organization_site,
              avatar:
                tenant.data.attributes.logo &&
                tenant.data.attributes.logo.medium,
              tenantLocales: tenant.data.attributes.settings.core.locales,
            },
            { integrations: integrations(user) }
          );
        } else {
          // no user
          analytics.identify(tenantInfo(tenant.data), {
            integrations: integrations(user),
            Intercom: { hideDefaultLauncher: true },
          } as any);
        }
      }
    });

    combineLatest([
      currentAppConfigurationStream().observable,
      authUserStream().observable,
      bufferUntilInitialized('segment', events$),
    ]).subscribe(([tenant, user, event]) => {
      if (!isNilOrError(tenant)) {
        if (isFunction(get(window, 'analytics.track'))) {
          analytics.track(
            event.name,
            {
              ...tenantInfo(tenant.data),
              location: window?.location?.pathname,
              ...event.properties,
            },
            { integrations: integrations(user) }
          );
        }
      }
    });

    combineLatest([
      currentAppConfigurationStream().observable,
      authUserStream().observable,
      bufferUntilInitialized('segment', pageChanges$),
    ]).subscribe(([tenant, user, pageChange]) => {
      if (!isNilOrError(tenant) && isFunction(get(window, 'analytics.page'))) {
        analytics.page(
          '',
          {
            path: pageChange.path,
            url: `https://${tenant.data.attributes.host}${pageChange.path}`,
            title: null,
            ...tenantInfo(tenant.data),
            ...pageChange.properties,
          },
          { integrations: integrations(user) }
        );
      }
    });

    registerDestination(destinationConfig);
  },
};

export default configuration;
