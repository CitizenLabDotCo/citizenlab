// libraries
import React from 'react';
import Helmet from 'react-helmet';
import { adopt } from 'react-adopt';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';

interface InputProps { }

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenantLocales: GetTenantLocalesChildProps;
}

interface Props extends InputProps, DataProps { }

const IdeaMeta: React.SFC<Props & InjectedIntlProps> = ({ intl, authUser, tenantLocales }) => {
  const { formatMessage } = intl;
  const { location } = window;

  const ideasIndexTitle = formatMessage(messages.metaTitle);
  const ideasIndexDescription = formatMessage(messages.metaDescription);

  return (
    <Helmet>
      <title>
        {`
          ${(authUser && authUser.attributes.unread_notifications) ? `(${authUser.attributes.unread_notifications}) ` : ''}
          ${ideasIndexTitle}`
        }
      </title>
      {getAlternateLinks(tenantLocales, location)}
      <meta name="title" content={ideasIndexTitle} />
      <meta name="description" content={ideasIndexDescription} />
      <meta property="og:title" content={ideasIndexTitle} />
      <meta property="og:description" content={ideasIndexDescription} />
      <meta property="og:url" content={location.href} />
    </Helmet>
  );
};

const IdeaMetaWithHoc = injectIntl<Props>(IdeaMeta);

const Data = adopt<DataProps, InputProps>({
  tenantLocales: <GetTenantLocales />,
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <IdeaMetaWithHoc {...inputProps} {...dataprops} />}
  </Data>
);
