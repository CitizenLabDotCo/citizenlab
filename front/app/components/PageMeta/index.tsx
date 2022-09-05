// libraries
import React from 'react';
import { Helmet } from 'react-helmet';
import { isError } from 'lodash-es';

// i18n
import { injectIntl, MessageDescriptor } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

interface Props {
  titleMessage: MessageDescriptor;
  descriptionMessage: MessageDescriptor;
}

const PageMeta = React.memo<Props & InjectedIntlProps>(
  ({ intl, titleMessage, descriptionMessage }) => {
    const authUser = useAuthUser();
    const tenantLocales = useAppConfigurationLocales();

    const { formatMessage } = intl;
    const { location } = window;
    const ideasIndexTitle = formatMessage(titleMessage);
    const ideasIndexDescription = formatMessage(descriptionMessage);

    return (
      <Helmet>
        <title>
          {`
          ${
            authUser &&
            !isError(authUser) &&
            authUser.attributes.unread_notifications
              ? `(${authUser.attributes.unread_notifications}) `
              : ''
          }
          ${ideasIndexTitle}`}
        </title>
        {getAlternateLinks(tenantLocales)}
        {getCanonicalLink()}
        <meta name="title" content={ideasIndexTitle} />
        <meta name="description" content={ideasIndexDescription} />
        <meta property="og:title" content={ideasIndexTitle} />
        <meta property="og:description" content={ideasIndexDescription} />
        <meta property="og:url" content={location.href} />
      </Helmet>
    );
  }
);

export default injectIntl(PageMeta);
