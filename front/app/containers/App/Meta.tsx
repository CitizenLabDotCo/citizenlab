import React from 'react';

import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useHomepageLayout from 'api/home_page_layout/useHomepageLayout';
import useAuthUser from 'api/me/useAuthUser';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { API_PATH } from 'containers/App/constants';

import { useIntl } from 'utils/cl-intl';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
import { imageSizes } from 'utils/fileUtils';

import messages from './messages';

const Meta = () => {
  const locale = useLocale();
  const { data: tenant } = useAppConfiguration();
  const { data: homepageLayout } = useHomepageLayout();
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { pathname } = useLocation();

  if (tenant && homepageLayout) {
    const favicon = tenant.data.attributes.favicon;
    const settings = tenant.data.attributes.settings;
    const tenantLocales = settings.core.locales;

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const headerBg = homepageLayout.data.attributes.craftjs_json
      ? Object.values(homepageLayout.data.attributes.craftjs_json).find(
          (node) => {
            return (
              typeof node.type === 'object' &&
              node.type !== null &&
              'resolvedName' in node.type &&
              node.type.resolvedName === 'HomepageBanner'
            );
          }
        )?.props.image?.imageUrl
      : '';

    const organizationNameMultiLoc = settings.core.organization_name;
    const organizationName = localize(organizationNameMultiLoc);
    const url = `https://${tenant.data.attributes.host}`;
    const fbAppId = settings.facebook_login && settings.facebook_login.app_id;

    const metaTitleMultiLoc = settings.core.meta_title;
    const metaTitle =
      localize(metaTitleMultiLoc) || formatMessage(messages.metaTitle1);

    const metaDescriptionMultiLoc = settings.core.meta_description;
    let metaDescription = localize(metaDescriptionMultiLoc);
    metaDescription =
      metaDescription || formatMessage(messages.appMetaDescription);
    const googleSearchConsoleMetaAttribute =
      settings.core.google_search_console_meta_attribute;

    const lifecycleStage = settings.core.lifecycle_stage;
    const blockIndexing = !['active', 'churned'].includes(lifecycleStage);

    const esriApiKey =
      tenant.data.attributes.settings.esri_integration?.api_key;

    // Show default tags only in the backoffice.
    // All other front office pages have their own title and description meta tags.
    // Ideally, we should ensure that all backoffice pages have their own meta tags and remove them from here..
    // This is necessary because on initial load, Helmet is not overriding them in child pages.
    const showDefaultTitleAndDescTags = pathname.startsWith(
      `/${locale}/admin/`
    );

    return (
      <Helmet>
        <html lang={locale} />
        {blockIndexing && <meta name="robots" content="noindex" />}
        {/* https://github.com/nfl/react-helmet/issues/279 href comes first! */}
        {getCanonicalLink()}
        {getAlternateLinks(tenantLocales)}

        {showDefaultTitleAndDescTags && (
          <title>
            {`${
              authUser && authUser.data.attributes.unread_notifications
                ? `(${authUser.data.attributes.unread_notifications}) `
                : ''
            } ${metaTitle}`}
          </title>
        )}
        {showDefaultTitleAndDescTags && (
          <meta name="title" content={metaTitle} />
        )}
        {showDefaultTitleAndDescTags && (
          <meta property="og:title" content={metaTitle} />
        )}
        {showDefaultTitleAndDescTags && (
          <meta name="description" content={metaDescription} />
        )}
        {showDefaultTitleAndDescTags && (
          <meta property="og:description" content={metaDescription} />
        )}

        {googleSearchConsoleMetaAttribute && (
          <meta
            name="google-site-verification"
            content={googleSearchConsoleMetaAttribute}
          />
        )}
        <meta property="og:type" content="website" />
        <meta property="og:image" content={headerBg} />
        <meta
          property="og:image:width"
          content={`${imageSizes.headerBg.large[0]}`}
        />
        <meta
          property="og:image:height"
          content={`${imageSizes.headerBg.large[1]}`}
        />
        <meta property="og:url" content={`${url}/${locale}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="fb:app_id" content={fbAppId} />
        <meta property="og:site_name" content={organizationName} />
        <meta name="application-name" content={organizationName} />
        {favicon && (
          <>
            {favicon.medium && (
              <link rel="icon" sizes="32x32" href={favicon.medium} />
            )}
            {favicon.small && (
              <link rel="icon" sizes="16x16" href={favicon.small} />
            )}
            {favicon.large && (
              <>
                <link
                  rel="apple-touch-icon"
                  sizes="152x152"
                  href={favicon.large}
                />
                <link rel="manifest" href={`${API_PATH}/manifest.json`} />
              </>
            )}
          </>
        )}
        {/* // For clients using an Esri API Key to access private data,
            // we need to make sure we're sending the platform URL as the referrer
            // in these requests.

            // In our nginx configuration, we're setting the referrer policy to 'no-referrer'
            // by default, so we need to override it here so Esri network requests work properly. */}
        {esriApiKey && <meta name="referrer" content="origin" />}
      </Helmet>
    );
  }

  return null;
};

export default Meta;
