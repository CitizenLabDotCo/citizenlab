// libraries
import React from 'react';
import { Helmet } from 'react-helmet';
import { isError } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps, MessageDescriptor } from 'react-intl';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useLocalize from 'hooks/useLocalize';
// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

interface Props {
  titleMessage: MessageDescriptor;
  descriptionMessage: MessageDescriptor;
}

const PageMeta = React.memo<Props & WrappedComponentProps>(
  ({ intl: { formatMessage }, titleMessage, descriptionMessage }) => {
    const authUser = useAuthUser();
    const tenantLocales = useAppConfigurationLocales();
    const localize = useLocalize();
    const appConfig = useAppConfiguration();
    const { location } = window;

    if (!isNilOrError(appConfig)) {
      const orgName = localize(
        appConfig.attributes.settings.core.organization_name
      );
      const ideasIndexTitle = formatMessage(titleMessage, {
        orgName,
      });
      const ideasIndexDescription = formatMessage(descriptionMessage, {
        orgName,
      });

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

    return null;
  }
);

export default injectIntl(PageMeta);
