import React from 'react';

// components
import { Helmet } from 'react-helmet';

// hooks
import useAuthUser from 'api/me/useAuthUser';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

// utils
import { stripHtml } from 'utils/textUtils';
import { imageSizes } from 'utils/fileUtils';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// typings
import { IProjectFolderData } from 'api/project_folders/types';
import useLocalize from 'hooks/useLocalize';

interface Props {
  projectFolder: IProjectFolderData;
}

const ProjectFolderShowPageMeta = ({ projectFolder }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const tenantLocales = useAppConfigurationLocales();
  const { data: authUser } = useAuthUser();

  if (!tenantLocales) return null;

  const metaTitle = formatMessage(messages.metaTitle, {
    title: localize(projectFolder.attributes.title_multiloc, { maxChar: 50 }),
  });
  const description = stripHtml(
    localize(projectFolder.attributes.description_multiloc),
    250
  );
  const image = projectFolder.attributes.header_bg?.large;
  const { location } = window;

  return (
    <Helmet>
      <title>
        {`${
          authUser &&
          typeof authUser.data.attributes.unread_notifications === 'number' &&
          authUser.data.attributes.unread_notifications > 0
            ? `(${authUser.data.attributes.unread_notifications}) `
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

  return null;
};

export default ProjectFolderShowPageMeta;
