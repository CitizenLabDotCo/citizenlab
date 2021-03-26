// libraries
import React from 'react';
import { Helmet } from 'react-helmet';
import { adopt } from 'react-adopt';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// services
import { IUserData } from 'services/users';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getLocalized } from 'utils/i18n';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

interface InputProps {
  user: IUserData;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenantLocales: GetAppConfigurationLocalesChildProps;
  tenant: GetAppConfigurationChildProps;
  locale: GetLocaleChildProps;
}

interface Props extends InputProps, DataProps {}

const UsersShowPageMeta: React.SFC<Props & InjectedIntlProps> = ({
  intl,
  authUser,
  tenantLocales,
  tenant,
  locale,
  user,
}) => {
  if (
    !isNilOrError(tenantLocales) &&
    !isNilOrError(locale) &&
    !isNilOrError(tenant)
  ) {
    const { formatMessage } = intl;
    const { location } = window;
    const firstName = user.attributes.first_name;
    const lastName = user.attributes.last_name;
    const organizationNameMultiLoc =
      tenant.attributes.settings.core.organization_name;
    const tenantName = getLocalized(
      organizationNameMultiLoc,
      locale,
      tenantLocales
    );

    const usersShowPageIndexTitle = formatMessage(messages.metaTitle, {
      firstName,
      lastName,
    });
    const usersShowPageDescription = formatMessage(
      messages.userShowPageMetaDescription,
      {
        firstName,
        lastName,
        tenantName,
      }
    );

    return (
      <Helmet>
        <title>
          {`
            ${
              authUser && authUser.attributes.unread_notifications
                ? `(${authUser.attributes.unread_notifications}) `
                : ''
            }
            ${usersShowPageIndexTitle}`}
        </title>
        {getCanonicalLink()}
        {getAlternateLinks(tenantLocales)}
        <meta name="title" content={usersShowPageIndexTitle} />
        <meta name="description" content={usersShowPageDescription} />
        <meta property="og:title" content={usersShowPageIndexTitle} />
        <meta property="og:description" content={usersShowPageDescription} />
        <meta property="og:url" content={location.href} />
      </Helmet>
    );
  }

  return null;
};

const UsersShowPageMetaWithHoc = injectIntl<Props>(UsersShowPageMeta);

const Data = adopt<DataProps, InputProps>({
  tenantLocales: <GetAppConfigurationLocales />,
  tenant: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
  locale: <GetLocale />,
});

const WrappedUsersShowPageMeta = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => <UsersShowPageMetaWithHoc {...inputProps} {...dataprops} />}
  </Data>
);

export default WrappedUsersShowPageMeta;
