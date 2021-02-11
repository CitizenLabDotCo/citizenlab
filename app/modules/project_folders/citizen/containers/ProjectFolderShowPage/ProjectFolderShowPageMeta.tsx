import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Helmet } from 'react-helmet';

// hooks
import useLocale from 'hooks/useLocale';
import useAuthUser from 'hooks/useAuthUser';
import useAppConfigurationLocales from 'hooks/useTenantLocales';

// utils
import { stripHtml } from 'utils/textUtils';
import { imageSizes } from 'utils/fileTools';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

// i18n
import { getLocalized } from 'utils/i18n';
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// typings
import { IProjectFolderData } from 'modules/project_folders/services/projectFolders';

interface Props {
  projectFolder: IProjectFolderData;
}

const Meta = memo<Props & InjectedIntlProps>(({ projectFolder, intl }) => {
  const locale = useLocale();
  const tenantLocales = useAppConfigurationLocales();
  const authUser = useAuthUser();

  if (
    !isNilOrError(locale) &&
    !isNilOrError(tenantLocales) &&
    !isNilOrError(projectFolder) &&
    projectFolder.attributes
  ) {
    const { formatMessage } = intl;
    const metaTitle = formatMessage(messages.metaTitle, {
      title: getLocalized(
        projectFolder.attributes.title_multiloc,
        locale,
        tenantLocales,
        50
      ),
    });
    const description = stripHtml(
      getLocalized(
        projectFolder.attributes.description_multiloc,
        locale,
        tenantLocales
      ),
      250
    );
    const image = projectFolder.attributes.header_bg?.large;
    const { location } = window;

    return (
      <Helmet>
        <title>
          {`${
            !isNilOrError(authUser) && authUser.attributes.unread_notifications
              ? `(${authUser.attributes.unread_notifications}) `
              : ''
          }
            ${metaTitle}`}
        </title>
        {getCanonicalLink()}
        {getAlternateLinks(tenantLocales)}
        <meta name="title" content={metaTitle} />
        <meta name="description" content={description} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={description} />
        {image && <meta property="og:image" content={image} />}
        <meta
          property="og:image:width"
          content={`${imageSizes.projectBg.large[0]}`}
        />
        <meta
          property="og:image:height"
          content={`${imageSizes.projectBg.large[1]}`}
        />
        <meta property="og:url" content={location.href} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
    );
  }

  return null;
});

export default injectIntl(Meta);
