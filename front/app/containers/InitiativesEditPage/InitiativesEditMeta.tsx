// libraries
import React from 'react';
import { Helmet } from 'react-helmet';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';

// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
import useLocalize from 'hooks/useLocalize';

interface InputProps {}

interface DataProps {
  authUser: GetAuthUserChildProps;
  appConfig: GetAppConfigurationChildProps;
  tenantLocales: GetAppConfigurationLocalesChildProps;
}

interface Props extends InputProps, DataProps {}

const InitiativesNewMeta = React.memo<Props & WrappedComponentProps>(
  ({ intl, authUser, tenantLocales, appConfig }) => {
    const localize = useLocalize();
    const { formatMessage } = intl;

    if (!isNilOrError(appConfig)) {
      const initiativesIndexTitle = formatMessage(messages.metaTitle, {
        orgName: localize(appConfig.attributes.settings.core.organization_name),
      });
      const initiativesIndexDescription = formatMessage(
        messages.metaDescription
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
        </Helmet>
      );
    }

    return null;
  }
);

const InitiativesNewMetaWithHoc = injectIntl<Props>(InitiativesNewMeta);

const Data = adopt<DataProps, InputProps>({
  tenantLocales: <GetAppConfigurationLocales />,
  authUser: <GetAuthUser />,
  appConfig: <GetAppConfiguration />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => (
      <InitiativesNewMetaWithHoc {...inputProps} {...dataprops} />
    )}
  </Data>
);
