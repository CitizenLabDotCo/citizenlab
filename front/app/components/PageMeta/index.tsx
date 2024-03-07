import React from 'react';

import { isError } from 'lodash-es';
import { Helmet } from 'react-helmet';
import { WrappedComponentProps, MessageDescriptor } from 'react-intl';

import useAuthUser from 'api/me/useAuthUser';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { injectIntl } from 'utils/cl-intl';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

interface Props {
  titleMessage: MessageDescriptor;
  descriptionMessage: MessageDescriptor;
}

const PageMeta = React.memo<Props & WrappedComponentProps>(
  ({ intl, titleMessage, descriptionMessage }) => {
    const { data: authUser } = useAuthUser();
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
            authUser.data.attributes.unread_notifications
              ? `(${authUser.data.attributes.unread_notifications}) `
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
