// libraries
import React from 'react';
import Helmet from 'react-helmet';
import { adopt } from 'react-adopt';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// resources
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getLocalized } from 'utils/i18n';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

interface DataProps {
  tenantLocales: GetTenantLocalesChildProps;
  tenant: GetTenantChildProps;
  locale: GetLocaleChildProps;
}

interface Props extends DataProps { }

const SignUpPageMeta: React.SFC<Props & InjectedIntlProps> = ({ intl, tenantLocales, tenant, locale }) => {
  if (!isNilOrError(tenantLocales) && !isNilOrError(locale) && !isNilOrError(tenant)) {
    const { formatMessage } = intl;
    const { location } = window;
    const organizationNameMultiLoc = tenant.attributes.settings.core.organization_name;
    const tenantName = getLocalized(organizationNameMultiLoc, locale, tenantLocales);

    const signUpPageMetaTitle = formatMessage(messages.metaTitle, { tenantName });
    const signUpPageMetaDescription = formatMessage(messages.metaDescription);

    return (
      <Helmet>
        <title>
          {signUpPageMetaTitle}
        </title>
        {getCanonicalLink()}
        {getAlternateLinks(tenantLocales)}
        <meta name="title" content={signUpPageMetaTitle} />
        <meta name="description" content={signUpPageMetaDescription} />
        <meta property="og:title" content={signUpPageMetaTitle} />
        <meta property="og:description" content={signUpPageMetaDescription} />
        <meta property="og:url" content={location.href} />
      </Helmet>
    );
  }

  return null;
};

const SignUpPageMetaWithHoc = injectIntl<Props>(SignUpPageMeta);

const Data = adopt<DataProps>({
  tenantLocales: <GetTenantLocales />,
  tenant: <GetTenant />,
  locale: <GetLocale />,
});

const WrappedSignUpPageMeta = () => (
  <Data>
    {dataprops => <SignUpPageMetaWithHoc {...dataprops} />}
  </Data>
);

export default WrappedSignUpPageMeta;
