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
import GetTenantLocales, {
  GetTenantLocalesChildProps,
} from 'resources/GetTenantLocales';

// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

interface InputProps {}

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenantLocales: GetTenantLocalesChildProps;
}

interface Props extends InputProps, DataProps {}

const IdeasNewMeta = React.memo<Props & InjectedIntlProps>(
  ({ intl, authUser, tenantLocales }) => {
    const { formatMessage } = intl;
    const ideasIndexTitle = formatMessage(messages.metaTitle);
    const ideasIndexDescription = formatMessage(messages.metaDescription);

    return (
      <Helmet>
        <title>
          {`
          ${
            authUser && authUser.attributes.unread_notifications
              ? `(${authUser.attributes.unread_notifications}) `
              : ''
          }
          ${ideasIndexTitle}
        `}
        </title>
        {getAlternateLinks(tenantLocales)}
        {getCanonicalLink()}
        <meta name="title" content={ideasIndexTitle} />
        <meta name="description" content={ideasIndexDescription} />
        <meta property="og:title" content={ideasIndexTitle} />
        <meta property="og:description" content={ideasIndexDescription} />
      </Helmet>
    );
  }
);

const IdeasNewMetaWithHoc = injectIntl<Props>(IdeasNewMeta);

const Data = adopt<DataProps, InputProps>({
  tenantLocales: <GetTenantLocales />,
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => <IdeasNewMetaWithHoc {...inputProps} {...dataprops} />}
  </Data>
);
