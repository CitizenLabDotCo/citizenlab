// libraries
import React from 'react';
import { Helmet } from 'react-helmet';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useTenantLocales from 'hooks/useTenantLocales';

// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

interface Props {}

const IdeasNewMeta = React.memo<Props & InjectedIntlProps>(
  ({ intl: { formatMessage } }) => {
    const ideasIndexTitle = formatMessage(messages.metaTitle);
    const ideasIndexDescription = formatMessage(messages.metaDescription);
    const tenantLocales = useTenantLocales();
    const authUser = useAuthUser();

    return (
      <Helmet>
        <title>
          {`
          ${
            !isNilOrError(authUser) && authUser.attributes.unread_notifications
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

export default injectIntl(IdeasNewMeta);
