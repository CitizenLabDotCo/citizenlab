import React from 'react';

// libraries
import { Helmet } from 'react-helmet';

// resources

// i18n
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { imageSizes } from 'utils/fileUtils';
import { API_PATH } from 'containers/App/constants';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import useLocalize from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';
import useLocale from 'hooks/useLocale';
import useAuthUser from 'api/me/useAuthUser';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useHomepageLayout from 'api/home_page_layout/useHomepageLayout';

const Meta = () => {
  const locale = useLocale();
  const { data: tenant } = useAppConfiguration();
  const { data: homepageLayout } = useHomepageLayout();
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  if (
    !isNilOrError(locale) &&
    !isNilOrError(tenant) &&
    !isNilOrError(homepageLayout)
  ) {
    const tenantLocales = tenant.data.attributes.settings.core.locales;

    const headerBg = homepageLayout.data.attributes.craftjs_json
      ? Object.values(homepageLayout.data.attributes.craftjs_json).find(
          (node) => node.displayName === 'HomepageBanner'
        )?.props.image.imageUrl
      : '';

    const organizationNameMultiLoc =
      tenant.data.attributes.settings.core.organization_name;
    const organizationName = localize(organizationNameMultiLoc);
    const url = `https://${tenant.data.attributes.host}`;
    const fbAppId =
      tenant.data.attributes.settings.facebook_login &&
      tenant.data.attributes.settings.facebook_login.app_id;

    const metaTitleMultiLoc = tenant.data.attributes.settings.core.meta_title;
    let metaTitle = localize(metaTitleMultiLoc);
    metaTitle = metaTitle || formatMessage(messages.metaTitle);

    const metaDescriptionMultiLoc =
      tenant.data.attributes.settings.core.meta_description;
    let metaDescription = localize(metaDescriptionMultiLoc);
    metaDescription =
      metaDescription || formatMessage(messages.appMetaDescription);

    const lifecycleStage = tenant.data.attributes.settings.core.lifecycle_stage;
    const blockIndexing = !['active', 'churned'].includes(lifecycleStage);

    return (
      <Helmet>
        <html lang={locale} />
        {blockIndexing && <meta name="robots" content="noindex" />}
        <title>
          {`${
            authUser && authUser.data.attributes.unread_notifications
              ? `(${authUser.data.attributes.unread_notifications}) `
              : ''
          }
            ${metaTitle}`}
        </title>
        {/* https://github.com/nfl/react-helmet/issues/279 href comes first! */}
        {getCanonicalLink()}
        {getAlternateLinks(tenantLocales)}
        <meta name="title" content={metaTitle} />
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={metaDescription} />
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
        {tenant.data.attributes.favicon &&
          tenant.data.attributes.favicon.medium && (
            <link
              rel="icon"
              sizes="32x32"
              href={tenant.data.attributes.favicon.medium}
            />
          )}
        {tenant.data.attributes.favicon &&
          tenant.data.attributes.favicon.small && (
            <link
              rel="icon"
              sizes="16x16"
              href={tenant.data.attributes.favicon.small}
            />
          )}
        {tenant.data.attributes.favicon &&
          tenant.data.attributes.favicon.large && (
            <link
              rel="apple-touch-icon"
              sizes="152x152"
              href={tenant.data.attributes.favicon.large}
            />
          )}
        {tenant.data.attributes.favicon &&
          tenant.data.attributes.favicon.large && (
            <link rel="manifest" href={`${API_PATH}/manifest.json`} />
          )}
      </Helmet>
    );
  }

  return null;
};

export default Meta;
