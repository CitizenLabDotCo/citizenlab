import { events$, pageChanges$, tenantInfo } from 'utils/analytics';
import appConfigurationStream from 'api/app_configuration/appConfigurationStream';
import authUserStream from 'api/me/authUserStream';
import { combineLatest } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';
import { get, isFunction, isNil } from 'lodash-es';
import { IUser } from 'api/users/types';
import {
  isRegularUser,
  isProjectModerator,
  isAdmin,
  isSuperAdmin,
} from 'utils/permissions/roles';
import { ModuleConfiguration } from 'utils/moduleUtils';

const CL_SEGMENT_API_KEY = process.env.SEGMENT_API_KEY;

const lazyLoadedSnippet = async () => {
  const snippet = await import('@segment/snippet');
  return snippet.default;
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

let isSegmentEnabled = false;

const configuration: ModuleConfiguration = {
  beforeMountApplication: () => {
    if (!CL_SEGMENT_API_KEY) return;

    combineLatest([appConfigurationStream, authUserStream]).subscribe(
      async ([tenant, user]) => {
        if (tenant) {
          const segmentFeatureFlag = tenant.data.attributes.settings.segment;
          isSegmentEnabled = Boolean(
            // Feature flag is in place
            segmentFeatureFlag?.allowed &&
              segmentFeatureFlag?.enabled &&
              // User is admin or moderator
              !isNilOrError(user) &&
              !isRegularUser(user)
          );
        }

        // Ensure segment should be enabled but snippet hasn't been loaded already
        // in case of a user signing out and back in
        if (isSegmentEnabled && isNil(get(window, 'analytics'))) {
          const snippet = await lazyLoadedSnippet();
          const code = snippet.min({
            host: 'cdn.segment.com',
            load: true,
            page: false,
            apiKey: CL_SEGMENT_API_KEY,
          });

          // eslint-disable-next-line no-eval
          eval(code);
        }

        if (
          isSegmentEnabled &&
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
              integrations: integrations(user || null),
              Intercom: { hideDefaultLauncher: true },
            } as any);
          }
        }
      }
    );

    combineLatest([appConfigurationStream, authUserStream, events$]).subscribe(
      ([tenant, user, event]) => {
        if (isSegmentEnabled && !isNilOrError(tenant)) {
          if (isFunction(get(window, 'analytics.track'))) {
            analytics.track(
              event.name,
              {
                ...tenantInfo(tenant.data),
                location: window?.location?.pathname,
                ...event.properties,
              },
              { integrations: integrations(user || null) }
            );
          }
        }
      }
    );

    combineLatest([
      appConfigurationStream,
      authUserStream,
      pageChanges$,
    ]).subscribe(([tenant, user, pageChange]) => {
      if (
        isSegmentEnabled &&
        !isNilOrError(tenant) &&
        isFunction(get(window, 'analytics.page'))
      ) {
        analytics.page(
          '',
          {
            path: pageChange.path,
            url: `https://${tenant.data.attributes.host}${pageChange.path}`,
            title: null,
            ...tenantInfo(tenant.data),
            ...pageChange.properties,
          },
          { integrations: integrations(user || null) }
        );
      }
    });
  },
};

export default configuration;
