// libraries
import React from 'react';
import { Helmet } from 'react-helmet';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import useLocalize from 'hooks/useLocalize';
// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';

// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';

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

const InitiativesIndexMetaWithHoc = injectIntl<Props>(InitiativesIndexMeta);

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
