// libraries
import React, { memo } from 'react';
import { Helmet } from 'react-helmet';
import { WrappedComponentProps } from 'react-intl';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
// hooks
import useAuthUser from 'hooks/useAuthUser';
import useIdea from 'hooks/useIdea';
import useLocalize from 'hooks/useLocalize';
import useProject from 'hooks/useProject';
import { injectIntl } from 'utils/cl-intl';
// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
import { isNilOrError } from 'utils/helperUtils';
// i18n
import messages from './messages';

interface Props {
  ideaId: string;
  projectId: string;
}

const IdeasNewMeta = memo(
  ({
    intl: { formatMessage },
    ideaId,
    projectId,
  }: Props & WrappedComponentProps) => {
    const tenantLocales = useAppConfigurationLocales();
    const authUser = useAuthUser();
    const idea = useIdea({ ideaId });
    const project = useProject({ projectId });
    const localize = useLocalize();

    if (!isNilOrError(idea) && !isNilOrError(project)) {
      const postTitle = localize(idea.attributes.title_multiloc);
      const projectName = localize(project.attributes.title_multiloc);

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
              authUser.attributes.unread_notifications
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

    return null;
  }
);

export default injectIntl(IdeasNewMeta);
