// libraries
import React, { memo } from 'react';
import { Helmet } from 'react-helmet';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// resources
import GetTenantLocales, {
  GetTenantLocalesChildProps,
} from 'resources/GetTenantLocales';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// utils
import { isNilOrError, endsWith } from 'utils/helperUtils';
import { getLocalized } from 'utils/i18n';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

interface DataProps {
  tenantLocales: GetTenantLocalesChildProps;
  tenant: GetAppConfigurationChildProps;
  locale: GetLocaleChildProps;
}

interface Props extends DataProps {}

const SignUpInPageMeta = memo<Props & InjectedIntlProps & WithRouterProps>(
  ({ intl, location: { pathname }, tenantLocales, tenant, locale }) => {
    if (
      !isNilOrError(tenantLocales) &&
      !isNilOrError(locale) &&
      !isNilOrError(tenant)
    ) {
      const { formatMessage } = intl;
      const method = endsWith(pathname, 'sign-in') ? 'signin' : 'signup';
      const organizationNameMultiLoc =
        tenant.attributes.settings.core.organization_name;
      const tenantName = getLocalized(
        organizationNameMultiLoc,
        locale,
        tenantLocales
      );
      const pageMetaTitle = formatMessage(
        method === 'signin'
          ? messages.signInMetaTitle
          : messages.signUpMetaTitle,
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
          {getAlternateLinks(tenantLocales)}
          <meta name="title" content={pageMetaTitle} />
          <meta name="description" content={pageMetaDescription} />
          <meta property="og:title" content={pageMetaTitle} />
          <meta property="og:description" content={pageMetaDescription} />
          <meta property="og:url" content={window.location.href} />
        </Helmet>
      );
    }

    return null;
  }
);

const SignUpInPageMetaWithHoC = withRouter(injectIntl(SignUpInPageMeta));

const Data = adopt<DataProps>({
  tenantLocales: <GetTenantLocales />,
  tenant: <GetAppConfiguration />,
  locale: <GetLocale />,
});

export default () => (
  <Data>{(dataprops) => <SignUpInPageMetaWithHoC {...dataprops} />}</Data>
);
