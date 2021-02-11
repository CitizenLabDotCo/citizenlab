// libraries
import React, { memo } from 'react';
import { Helmet } from 'react-helmet';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useAppConfigurationLocales from 'hooks/useTenantLocales';
import useIdea from 'hooks/useIdea';
import useProject from 'hooks/useProject';
import useLocalize from 'hooks/useLocalize';

// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

interface Props {
  ideaId: string;
  projectId: string;
}

const IdeasNewMeta = memo(
  ({
    intl: { formatMessage },
    ideaId,
    projectId,
  }: Props & InjectedIntlProps) => {
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
