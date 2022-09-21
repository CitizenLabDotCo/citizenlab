// libraries
import React from 'react';
import { Helmet } from 'react-helmet';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import messages from './messages';
import { injectIntl } from 'react-intl';
import { WrappedComponentProps } from 'react-intl';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';
import useLocalize from 'hooks/useLocalize';
import useAppConfiguration from 'hooks/useAppConfiguration';
// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

interface InputProps {}

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenantLocales: GetAppConfigurationLocalesChildProps;
}

interface Props extends InputProps, DataProps {}

const InitiativesNewMeta = React.memo<Props & WrappedComponentProps>(
  ({ intl, authUser, tenantLocales }) => {
    const { formatMessage } = intl;
    const { location } = window;
    const localize = useLocalize();
    const appConfig = useAppConfiguration();

    if (!isNilOrError(appConfig)) {
      const orgName = localize(
        appConfig.attributes.settings.core.organization_name
      );
      const initiativesIndexTitle = formatMessage(messages.metaTitle, {
        orgName,
      });
      const initiativesIndexDescription = formatMessage(
        messages.metaDescription,
        {
          orgName,
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

const InitiativesNewMetaWithHoc = injectIntl(InitiativesNewMeta);

const Data = adopt<DataProps, InputProps>({
  tenantLocales: <GetAppConfigurationLocales />,
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => (
      <InitiativesNewMetaWithHoc {...inputProps} {...dataprops} />
    )}
  </Data>
);
