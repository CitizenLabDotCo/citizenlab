import React from 'react';

import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';

import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import { getInputTerm } from 'api/phases/utils';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
import { getInputTermMessage } from 'utils/i18n';

import messages from './messages';

const IdeasNewMeta = () => {
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
      getInputTermMessage(inputTerm, {
        idea: messages.ideaNewMetaTitle1,
        option: messages.optionMetaTitle1,
        project: messages.projectMetaTitle1,
        question: messages.questionMetaTitle1,
        issue: messages.issueMetaTitle1,
        contribution: messages.contributionMetaTitle1,
      })
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
