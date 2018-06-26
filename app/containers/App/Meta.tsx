import React from 'react';
import { adopt } from 'react-adopt';

// libraries
import Helmet from 'react-helmet';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// i18n
import messages from './messages';
import { getLocalized } from 'utils/i18n';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { imageSizes } from 'utils/imageTools';

interface InputProps { }

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetTenantChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps { }

const Meta: React.SFC<Props & InjectedIntlProps> = ({ locale, tenant, authUser, intl }) => {
  if (!isNilOrError(locale) && !isNilOrError(tenant)) {
    const { formatMessage } = intl;
    const tenantLocales = tenant.attributes.settings.core.locales;
    const headerBg = tenant.attributes.header_bg.large || '';
    const organizationNameMultiLoc = tenant.attributes.settings.core.organization_name;
    const organizationName = getLocalized(organizationNameMultiLoc, locale, tenantLocales);
    const url = `https://${tenant.attributes.host}`;
    const fbAppId = tenant.attributes.settings.facebook_login && tenant.attributes.settings.facebook_login.app_id;

    const metaTitleMultiLoc = tenant.attributes.settings.core.meta_title;
    let metaTitle = getLocalized(metaTitleMultiLoc, locale, tenantLocales, 50);
    metaTitle = (metaTitle || formatMessage(messages.metaTitle));

    const metaDescriptionMultiLoc = tenant.attributes.settings.core.meta_description;
    let metaDescription = getLocalized(metaDescriptionMultiLoc, locale, tenantLocales);
    metaDescription = (metaDescription || formatMessage(messages.metaDescription));

    const lifecycleStage = tenant.attributes.settings.core.lifecycle_stage;
    const blockIndexing = lifecycleStage === 'demo' || lifecycleStage === 'not_applicable';

    return (
      <Helmet>
        <html lang={locale}/>
        {blockIndexing && <meta name="robots" content="noindex" />}
        <title>
          {`
            ${(authUser && authUser.attributes.unread_notifications) ? `(${authUser.attributes.unread_notifications}) ` : ''}
            ${metaTitle}`
          }
        </title>
        <meta name="title" content={metaTitle} />
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={headerBg} />
        <meta property="og:image:width" content={`${imageSizes.headerBg.large[0]}`} />
        <meta property="og:image:height" content={`${imageSizes.headerBg.large[1]}`} />
        <meta property="og:url" content={url} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="fb:app_id" content={fbAppId} />
        <meta property="og:site_name" content={organizationName} />
      </Helmet>
    );
  }

  return null;
};

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetTenant />,
  authUser: <GetAuthUser />,
});

const MetaWithHoc = injectIntl<Props>(Meta);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <MetaWithHoc {...inputProps} {...dataProps} />}
  </Data>
);
