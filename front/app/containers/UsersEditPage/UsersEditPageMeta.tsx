// libraries
import React from 'react';
import { Helmet } from 'react-helmet';
import { WrappedComponentProps } from 'react-intl';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useAuthUser from 'hooks/useAuthUser';
// hooks
import useLocale from 'hooks/useLocale';
// services
import { IUserData } from 'services/users';
import { injectIntl } from 'utils/cl-intl';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
// utils
import { isNilOrError } from 'utils/helperUtils';
import { getLocalized } from 'utils/i18n';
// i18n
import messages from './messages';

interface Props {
  user: IUserData;
}

const UsersEditPageMeta = React.memo<Props & WrappedComponentProps>(
  ({ intl, user }) => {
    const locale = useLocale();
    const tenantLocales = useAppConfigurationLocales();
    const authUser = useAuthUser();
    const appConfig = useAppConfiguration();

    if (
      !isNilOrError(tenantLocales) &&
      !isNilOrError(locale) &&
      !isNilOrError(appConfig) &&
      !isNilOrError(authUser)
    ) {
      const { formatMessage } = intl;
      const { location } = window;
      const firstName = user.attributes.first_name;
      const lastName = user.attributes.last_name;
      const organizationNameMultiLoc =
        appConfig.attributes.settings.core.organization_name;
      const tenantName = getLocalized(
        organizationNameMultiLoc,
        locale,
        tenantLocales
      );

      const usersEditPageIndexTitle = formatMessage(messages.metaTitle, {
        firstName,
        lastName,
      });
      const usersEditPageDescription = formatMessage(messages.metaDescription, {
        firstName,
        lastName,
        tenantName,
      });

      return (
        <Helmet>
          <title>
            {`
            ${
              authUser && authUser.attributes.unread_notifications
                ? `(${authUser.attributes.unread_notifications}) `
                : ''
            }
            ${usersEditPageIndexTitle}`}
          </title>
          {getCanonicalLink()}
          {getAlternateLinks(tenantLocales)}
          <meta name="title" content={usersEditPageIndexTitle} />
          <meta name="description" content={usersEditPageDescription} />
          <meta property="og:title" content={usersEditPageIndexTitle} />
          <meta property="og:description" content={usersEditPageDescription} />
          <meta property="og:url" content={location.href} />
        </Helmet>
      );
    }

    return null;
  }
);

const UsersEditPageMetaWithHoc = injectIntl(UsersEditPageMeta);

export default UsersEditPageMetaWithHoc;
