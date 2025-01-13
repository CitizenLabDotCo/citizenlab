import React from 'react';

import { Helmet } from 'react-helmet-async';

import useAuthUser from 'api/me/useAuthUser';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { useIntl } from 'utils/cl-intl';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

import messages from './messages';

const ProjectsMeta = () => {
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();
  const tenantLocales = useAppConfigurationLocales();
  const { location } = window;
  const projectsIndexTitle = formatMessage(messages.metaTitle1);
  const projectsIndexDescription = formatMessage(messages.metaDescription);

  return (
    <Helmet>
      <title>
        {`
          ${
            authUser && authUser.data.attributes.unread_notifications
              ? `(${authUser.data.attributes.unread_notifications}) `
              : ''
          }
          ${projectsIndexTitle}`}
      </title>
      {getCanonicalLink()}
      {getAlternateLinks(tenantLocales)}
      <meta name="title" content={projectsIndexTitle} />
      <meta name="description" content={projectsIndexDescription} />
      <meta property="og:title" content={projectsIndexTitle} />
      <meta property="og:description" content={projectsIndexDescription} />
      <meta property="og:url" content={location.href} />
    </Helmet>
  );
};

export default ProjectsMeta;
