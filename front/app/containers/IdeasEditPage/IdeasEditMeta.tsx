// libraries
import React, { memo } from 'react';
import { Helmet } from 'react-helmet';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';
import { useIntl } from 'utils/cl-intl';

import useAuthUser from 'api/me/useAuthUser';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useIdeaById from 'api/ideas/useIdeaById';
import useProjectById from 'api/projects/useProjectById';
import useLocalize from 'hooks/useLocalize';

import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

interface Props {
  ideaId: string;
  projectId: string;
}

const IdeasNewMeta = memo(({ ideaId, projectId }: Props) => {
  const { formatMessage } = useIntl();
  const tenantLocales = useAppConfigurationLocales();
  const { data: authUser } = useAuthUser();
  const { data: idea } = useIdeaById(ideaId);
  const { data: project } = useProjectById(projectId);
  const localize = useLocalize();

  if (idea && project) {
    const postTitle = localize(idea.data.attributes.title_multiloc);
    const projectName = localize(project.data.attributes.title_multiloc);

    const ideasIndexTitle = formatMessage(messages.ideasEditMetaTitle, {
      postTitle,
      projectName,
    });
    const ideasIndexDescription = formatMessage(
      messages.ideasEditMetaDescription
    );

    return (
      <Helmet>
        <title>
          {`
            ${
              !isNilOrError(authUser) &&
              authUser.data.attributes.unread_notifications
                ? `(${authUser.data.attributes.unread_notifications}) `
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

  return null;
});

export default IdeasNewMeta;
