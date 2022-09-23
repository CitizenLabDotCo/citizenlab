// libraries
import useLocalize from 'hooks/useLocalize';
import React from 'react';
import { adopt } from 'react-adopt';
import { Helmet } from 'react-helmet';
import { isNilOrError } from 'utils/helperUtils';
// i18n
import { injectIntl, WrappedComponentProps } from 'react-intl';
import messages from './messages';

// resources
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// utils
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

interface InputProps {}

interface DataProps {
  authUser: GetAuthUserChildProps;
  appConfig: GetAppConfigurationChildProps;
  tenantLocales: GetAppConfigurationLocalesChildProps;
}

interface Props extends InputProps, DataProps {}

const InitiativesIndexMeta = React.memo<Props & WrappedComponentProps>(
  ({ intl: { formatMessage }, authUser, tenantLocales, appConfig }) => {
    const { location } = window;
    const localize = useLocalize();

    if (!isNilOrError(appConfig)) {
      const orgName = localize(
        appConfig.attributes.settings.core.organization_name
      );
      const initiativesIndexTitle = formatMessage(messages.metaTitle, {
        orgName,
      });
      const initiativesIndexDescription = formatMessage(
        messages.metaDescription,
        { orgName }
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
            ${initiativesIndexTitle}`}
          </title>
          {getAlternateLinks(tenantLocales)}
          {getCanonicalLink()}
          <meta name="title" content={initiativesIndexTitle} />
          <meta name="description" content={initiativesIndexDescription} />
          <meta property="og:title" content={initiativesIndexTitle} />
          <meta
            property="og:description"
            content={initiativesIndexDescription}
          />
          <meta property="og:url" content={location.href} />
        </Helmet>
      );
    }

    return null;
  }
);

const InitiativesIndexMetaWithHoc = injectIntl(InitiativesIndexMeta);

const Data = adopt<DataProps, InputProps>({
  tenantLocales: <GetAppConfigurationLocales />,
  authUser: <GetAuthUser />,
  appConfig: <GetAppConfiguration />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => (
      <InitiativesIndexMetaWithHoc {...inputProps} {...dataprops} />
    )}
  </Data>
);
