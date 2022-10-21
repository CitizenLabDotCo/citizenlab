// libraries
import React from 'react';
import { Helmet } from 'react-helmet';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useAuthUser from 'hooks/useAuthUser';
import useLocale from 'hooks/useLocale';

// services
import { IUserData } from 'services/users';

// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
import { isNilOrError } from 'utils/helperUtils';
import { getLocalized } from 'utils/i18n';

interface Props {
  user: IUserData;
}

const UsersEditPageMeta = React.memo<Props & WrappedComponentProps>(
  ({ intl, user }) => {
    const locale = useLocale();
    const tenantLocales = useAppConfigurationLocales();
    const authUser = useAuthUser();
    const tenant = useAppConfiguration();

    if (
      !isNilOrError(tenantLocales) &&
      !isNilOrError(locale) &&
      !isNilOrError(tenant) &&
      !isNilOrError(authUser)
    ) {
      const { formatMessage } = intl;
      const { location } = window;
      const firstName = user.attributes.first_name;
      const lastName = user.attributes.last_name;
      const organizationNameMultiLoc =
        tenant.attributes.settings.core.organization_name;
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
