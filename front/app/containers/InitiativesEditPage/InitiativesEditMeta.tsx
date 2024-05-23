import React from 'react';

import { Helmet } from 'react-helmet';

import useAuthUser from 'api/me/useAuthUser';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { useIntl } from 'utils/cl-intl';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

import messages from './messages';

const InitiativesEditMeta = () => {
  const tenantLocales = useAppConfigurationLocales();
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();
  const initiativesIndexTitle = formatMessage(messages.metaTitle1);
  const initiativesIndexDescription = formatMessage(messages.metaDescription1);

  return (
    <Helmet>
      <title>
        {`
          ${
            authUser && authUser.data.attributes.unread_notifications
              ? `(${authUser.data.attributes.unread_notifications}) `
              : ''
          }
          ${initiativesIndexTitle}`}
      </title>
      {getAlternateLinks(tenantLocales)}
      {getCanonicalLink()}
      <meta name="title" content={initiativesIndexTitle} />
      <meta name="description" content={initiativesIndexDescription} />
      <meta property="og:title" content={initiativesIndexTitle} />
      <meta property="og:description" content={initiativesIndexDescription} />
    </Helmet>
  );
};

export default InitiativesEditMeta;
