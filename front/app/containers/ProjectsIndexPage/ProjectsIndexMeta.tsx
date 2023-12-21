// libraries
import React from 'react';
import { Helmet } from 'react-helmet';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

// resources
import useAuthUser from 'api/me/useAuthUser';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

const ProjectsMeta = () => {
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();
  const tenantLocales = useAppConfigurationLocales();
  const { location } = window;
  const projectsIndexTitle = formatMessage(messages.metaTitle);
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
