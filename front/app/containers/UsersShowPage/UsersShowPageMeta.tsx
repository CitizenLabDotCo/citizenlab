// libraries
import React from 'react';
import { Helmet } from 'react-helmet';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// services
import { IUserData } from 'api/users/types';

// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
import useLocalize from 'hooks/useLocalize';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useAuthUser from 'api/me/useAuthUser';

interface Props {
  user: IUserData;
}

const UsersShowPageMeta = ({ user }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: authUser } = useAuthUser();
  const { data: tenant } = useAppConfiguration();
  const tenantLocales = useAppConfigurationLocales();

  if (!tenantLocales || !tenant) {
    return null;
  }

  const { location } = window;
  const firstName = user.attributes.first_name;
  const lastName = user.attributes.last_name;
  const organizationNameMultiLoc =
    tenant.data.attributes.settings.core.organization_name;
  const tenantName = localize(organizationNameMultiLoc);

  if (
    firstName === undefined ||
    firstName === null ||
    lastName === undefined ||
    lastName === null
  ) {
    return null;
  }

  const usersShowPageIndexTitle = formatMessage(messages.metaTitle, {
    firstName,
    lastName,
  });
  const usersShowPageDescription = formatMessage(
    messages.userShowPageMetaDescription,
    {
      firstName,
      lastName,
      tenantName,
    }
  );

  return (
    <Helmet>
      <title>
        {`
            ${
              authUser && authUser.data.attributes.unread_notifications
                ? `(${authUser.data.attributes.unread_notifications}) `
                : ''
            }
            ${usersShowPageIndexTitle}`}
      </title>
      {getCanonicalLink()}
      {getAlternateLinks(tenantLocales)}
      <meta name="title" content={usersShowPageIndexTitle} />
      <meta name="description" content={usersShowPageDescription} />
      <meta property="og:title" content={usersShowPageIndexTitle} />
      <meta property="og:description" content={usersShowPageDescription} />
      <meta property="og:url" content={location.href} />
      <meta name="robots" content="noindex" />
    </Helmet>
  );
};

export default UsersShowPageMeta;
