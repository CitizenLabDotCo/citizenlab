import React from 'react';

import { Helmet } from 'react-helmet-async';

import useAuthUser from 'api/me/useAuthUser';
import { IProjectData } from 'api/projects/types';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocalize from 'hooks/useLocalize';

import messages from 'containers/ProjectsShowPage/messages';

import { useIntl } from 'utils/cl-intl';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
import { imageSizes } from 'utils/fileUtils';
import { stripHtml } from 'utils/textUtils';

interface Props {
  project: IProjectData;
}

const IdeasFeedPageMeta = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const tenantLocales = useAppConfigurationLocales();
  const { data: authUser } = useAuthUser();

  if (!tenantLocales) return null;

  const metaTitle = formatMessage(messages.metaTitle1, {
    projectTitle: localize(project.attributes.title_multiloc, {
      maxChar: 50,
    }),
  });
  const description = stripHtml(
    localize(project.attributes.description_multiloc),
    250
  );
  const image = project.attributes.header_bg.large;
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
      {!project.attributes.listed && <meta name="robots" content="noindex" />}
    </Helmet>
  );
};

export default IdeasFeedPageMeta;
