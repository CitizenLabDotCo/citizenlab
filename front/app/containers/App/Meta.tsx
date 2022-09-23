import React from 'react';
import { adopt } from 'react-adopt';

// libraries
import { Helmet } from 'react-helmet';

// resources
import useHomepageSettings from 'hooks/useHomepageSettings';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// i18n
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// utils
import { API_PATH } from 'containers/App/constants';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
import { imageSizes } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {}

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetAppConfigurationChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

const Meta: React.SFC<Props & WrappedComponentProps> = ({
  locale,
  tenant,
  authUser,
  intl,
}) => {
  const homepageSettings = useHomepageSettings();
  if (
    !isNilOrError(locale) &&
    !isNilOrError(tenant) &&
    !isNilOrError(homepageSettings)
  ) {
    const { formatMessage } = intl;
    const tenantLocales = tenant.attributes.settings.core.locales;
    const headerBg =
      homepageSettings.data.attributes.header_bg &&
      homepageSettings.data.attributes.header_bg.large
        ? homepageSettings.data.attributes.header_bg.large
        : '';
    const organizationNameMultiLoc =
      tenant.attributes.settings.core.organization_name;
    const organizationName = getLocalized(
      organizationNameMultiLoc,
      locale,
      tenantLocales
    );
    const url = `https://${tenant.attributes.host}`;
    const fbAppId =
      tenant.attributes.settings.facebook_login &&
      tenant.attributes.settings.facebook_login.app_id;

    const metaTitleMultiLoc = tenant.attributes.settings.core.meta_title;
    let metaTitle = getLocalized(metaTitleMultiLoc, locale, tenantLocales, 50);
    metaTitle =
      metaTitle ||
      formatMessage(messages.metaTitle, { orgName: organizationName });

    const metaDescriptionMultiLoc =
      tenant.attributes.settings.core.meta_description;
    let metaDescription = getLocalized(
      metaDescriptionMultiLoc,
      locale,
      tenantLocales
    );
    metaDescription =
      metaDescription ||
      formatMessage(messages.appMetaDescription, { orgName: organizationName });

    const lifecycleStage = tenant.attributes.settings.core.lifecycle_stage;
    const blockIndexing = !['active', 'churned'].includes(lifecycleStage);

    return (
      <Helmet>
        <html lang={locale} />
        {blockIndexing && <meta name="robots" content="noindex" />}
        <title>
          {`${
            authUser && authUser.attributes.unread_notifications
              ? `(${authUser.attributes.unread_notifications}) `
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
        {tenant.attributes.favicon && tenant.attributes.favicon.medium && (
          <link
            rel="icon"
            sizes="32x32"
            href={tenant.attributes.favicon.medium}
          />
        )}
        {tenant.attributes.favicon && tenant.attributes.favicon.small && (
          <link
            rel="icon"
            sizes="16x16"
            href={tenant.attributes.favicon.small}
          />
        )}
        {tenant.attributes.favicon && tenant.attributes.favicon.large && (
          <link
            rel="apple-touch-icon"
            sizes="152x152"
            href={tenant.attributes.favicon.large}
          />
        )}
        {tenant.attributes.favicon && tenant.attributes.favicon.large && (
          <link rel="manifest" href={`${API_PATH}/manifest.json`} />
        )}
      </Helmet>
    );
  }

  return null;
};

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
});

const MetaWithHoc = injectIntl(Meta);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <MetaWithHoc {...inputProps} {...dataProps} />}
  </Data>
);
