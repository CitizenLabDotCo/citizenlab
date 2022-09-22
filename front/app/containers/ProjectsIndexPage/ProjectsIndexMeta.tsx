// libraries
import React from 'react';
import { Helmet } from 'react-helmet';
import { isNilOrError } from 'utils/helperUtils';
// i18n
import { injectIntl, WrappedComponentProps } from 'react-intl';
import messages from './messages';

// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

// resources
import useAppConfiguration from 'hooks/useAppConfiguration';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useAuthUser from 'hooks/useAuthUser';
import useLocalize from 'hooks/useLocalize';

interface Props {}

const ProjectsMeta = ({ intl }: Props & WrappedComponentProps) => {
  const { formatMessage } = intl;
  const { location } = window;
  const authUser = useAuthUser();
  const localize = useLocalize();
  const tenantLocales = useAppConfigurationLocales();
  const appConfig = useAppConfiguration();

  if (!isNilOrError(authUser) && !isNilOrError(appConfig)) {
    const orgName = localize(
      appConfig.attributes.settings.core.organization_name
    );
    const projectsIndexTitle = formatMessage(messages.metaTitle, { orgName });
    const projectsIndexDescription = formatMessage(messages.metaDescription, {
      orgName,
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
  }

  return null;
};

export default injectIntl(ProjectsMeta);
