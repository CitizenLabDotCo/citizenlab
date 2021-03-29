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

// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

interface InputProps {}

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenantLocales: GetAppConfigurationLocalesChildProps;
}

interface Props extends InputProps, DataProps {}

const InitiativesNewMeta = React.memo<Props & InjectedIntlProps>(
  ({ intl, authUser, tenantLocales }) => {
    const { formatMessage } = intl;
    const initiativesIndexTitle = formatMessage(messages.metaTitle);
    const initiativesIndexDescription = formatMessage(messages.metaDescription);

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
        <meta property="og:description" content={initiativesIndexDescription} />
      </Helmet>
    );
  }
);

const InitiativesNewMetaWithHoc = injectIntl<Props>(InitiativesNewMeta);

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
