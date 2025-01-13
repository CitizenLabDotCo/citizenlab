import React from 'react';

import { Helmet } from 'react-helmet-async';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocalize from 'hooks/useLocalize';

import messages from 'containers/App/messages';

import { useIntl } from 'utils/cl-intl';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

const HomePageMeta = () => {
  const { formatMessage } = useIntl();
  const tenantLocales = useAppConfigurationLocales();
  const { data: authUser } = useAuthUser();
  const localize = useLocalize();
  const { data: tenant } = useAppConfiguration();

  if (tenant) {
    const metaTitleMultiLoc = tenant.data.attributes.settings.core.meta_title;
    const metaTitle =
      localize(metaTitleMultiLoc) || formatMessage(messages.metaTitle1);
    const metaDescriptionMultiLoc =
      tenant.data.attributes.settings.core.meta_description;
    let metaDescription = localize(metaDescriptionMultiLoc);
    metaDescription =
      metaDescription || formatMessage(messages.appMetaDescription);

    return (
      <Helmet>
        <title>
          {`${
            authUser && authUser.data.attributes.unread_notifications
              ? `(${authUser.data.attributes.unread_notifications}) `
              : ''
          } ${metaTitle}`}
        </title>
        {getAlternateLinks(tenantLocales)}
        {getCanonicalLink()}
        <meta name="title" content={metaTitle} />
        <meta property="og:title" content={metaTitle} />
        <meta name="description" content={metaDescription} />
        <meta property="og:description" content={metaDescription} />
      </Helmet>
    );
  }

  return null;
};

export default HomePageMeta;
