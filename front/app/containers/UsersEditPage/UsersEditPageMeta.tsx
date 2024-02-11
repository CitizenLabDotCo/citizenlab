// libraries
import React from 'react';
import { Helmet } from 'react-helmet';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';

// services
import { IUserData } from 'api/users/types';

// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
import useLocalize from 'hooks/useLocalize';

interface Props {
  user: IUserData;
}

const UsersEditPageMeta = ({ user }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const tenantLocales = useAppConfigurationLocales();
  const { data: authUser } = useAuthUser();
  const { data: appConfig } = useAppConfiguration();
  const firstName = user.attributes.first_name;
  const lastName = user.attributes.last_name;

  if (
    !tenantLocales ||
    !appConfig ||
    !authUser ||
    typeof firstName !== 'string' ||
    typeof lastName !== 'string'
  ) {
    return null;
  }

  const { location } = window;
  const usersEditPageIndexTitle = formatMessage(messages.metaTitle, {
    firstName,
    lastName,
  });
  const usersEditPageDescription = formatMessage(messages.metaDescription, {
    firstName,
    lastName,
    tenantName: localize(
      appConfig.data.attributes.settings.core.organization_name
    ),
  });

  return (
    <Helmet>
      <title>
        {`
            ${
              typeof authUser.data.attributes.unread_notifications ===
                'number' && authUser.data.attributes.unread_notifications > 0
                ? `(${authUser.data.attributes.unread_notifications}) `
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
};

export default UsersEditPageMeta;
