// libraries
import React from 'react';
import { Helmet } from 'react-helmet';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';
import { getInputTermMessage } from 'utils/i18n';

// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

// services
import useLocalize from 'hooks/useLocalize';
import usePhases from 'api/phases/usePhases';
import useProjectBySlug from 'api/projects/useProjectBySlug';
import useAuthUser from 'api/me/useAuthUser';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { useParams } from 'react-router-dom';
import { getInputTerm } from 'api/phases/utils';

interface Props {
  isSurvey?: boolean;
}

const IdeasNewMeta = ({ isSurvey }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { slug } = useParams();
  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectBySlug(slug);
  const { data: phases } = usePhases(project ? project.data.id : undefined);
  const locales = useAppConfigurationLocales();
  const { location } = window;

  if (project) {
    const projectName = localize(project.data.attributes.title_multiloc);

    const inputTerm = getInputTerm(phases?.data);
    const ideasIndexTitle = formatMessage(
      isSurvey ?
        messages.surveyNewMetaTitle :
        getInputTermMessage(inputTerm, {
          idea: messages.ideaNewMetaTitle,
          option: messages.optionMetaTitle,
          project: messages.projectMetaTitle,
          question: messages.questionMetaTitle,
          issue: messages.issueMetaTitle,
          contribution: messages.contributionMetaTitle,
        }), { projectName }
    );
    const ideasIndexDescription = formatMessage(
      messages.ideaNewMetaDescription,
      {
        projectName,
      }
    );

    return (
      <Helmet>
        <title>
          {`
            ${
              authUser && authUser.data.attributes.unread_notifications
                ? `(${authUser.data.attributes.unread_notifications}) `
                : ''
            }
            ${ideasIndexTitle}
          `}
        </title>
        {getAlternateLinks(locales)}
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
};

export default IdeasNewMeta;
