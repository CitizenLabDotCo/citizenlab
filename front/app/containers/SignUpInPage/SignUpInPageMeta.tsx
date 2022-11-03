// libraries
import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import messages from './messages';

// hooks
import useLocale from 'hooks/useLocale';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useAppConfiguration from 'hooks/useAppConfiguration';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError, endsWith } from 'utils/helperUtils';
import { getLocalized } from 'utils/i18n';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

const SignUpInPageMeta = () => {
  const { pathname } = useLocation();
  const { formatMessage } = useIntl();
  const appConfig = useAppConfiguration();
  const locales = useAppConfigurationLocales();
  const locale = useLocale();

  if (
    !isNilOrError(locales) &&
    !isNilOrError(locale) &&
    !isNilOrError(appConfig)
  ) {
    const method = endsWith(pathname, 'sign-in') ? 'signin' : 'signup';
    const organizationNameMultiLoc =
      appConfig.attributes.settings.core.organization_name;
    const tenantName = getLocalized(organizationNameMultiLoc, locale, locales);
    const pageMetaTitle = formatMessage(
      method === 'signin' ? messages.signInMetaTitle : messages.signUpMetaTitle,
      { tenantName }
    );
    const pageMetaDescription = formatMessage(
      method === 'signin'
        ? messages.signInPageMetaDescription
        : messages.signUpPageMetaDescription
    );

    return (
      <Helmet>
        <title>{pageMetaTitle}</title>
        {getCanonicalLink()}
        {getAlternateLinks(locales)}
        <meta name="title" content={pageMetaTitle} />
        <meta name="description" content={pageMetaDescription} />
        <meta property="og:title" content={pageMetaTitle} />
        <meta property="og:description" content={pageMetaDescription} />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
    );
  }

  return null;
};

export default SignUpInPageMeta;
