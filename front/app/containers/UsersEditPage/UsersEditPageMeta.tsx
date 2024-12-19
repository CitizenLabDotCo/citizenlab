import React from 'react';

import { Helmet } from 'react-helmet-async';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IUser } from 'api/users/types';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

import messages from './messages';

interface Props {
  authUser: IUser;
}

const UsersEditPageMeta = ({ authUser }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const tenantLocales = useAppConfigurationLocales();
  const { data: appConfig } = useAppConfiguration();
  const firstName = authUser.data.attributes.first_name;
  const lastName = authUser.data.attributes.last_name;

  if (
    !tenantLocales ||
    !appConfig ||
    typeof firstName !== 'string' ||
    typeof lastName !== 'string'
  ) {
    return null;
  }

  const { location } = window;
  const usersEditPageIndexTitle = formatMessage(messages.metaTitle1, {
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
