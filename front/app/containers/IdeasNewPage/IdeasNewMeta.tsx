import React from 'react';

import { Helmet } from 'react-helmet-async';
import { useParams } from 'utils/router';

import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import { getInputTerm } from 'api/phases/utils';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { useIntl } from 'utils/cl-intl';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
import { getInputTermMessage } from 'utils/i18n';

import messages from './messages';

const IdeasNewMeta = () => {
  const { formatMessage } = useIntl();
  const { slug } = useParams({ from: '/$locale/projects/$slug/ideas/new' });
  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectBySlug(slug);
  const { data: phases } = usePhases(project ? project.data.id : undefined);
  const locales = useAppConfigurationLocales();
  const { location } = window;

  const inputTerm = getInputTerm(phases?.data);
  const ideasIndexTitle = formatMessage(
    getInputTermMessage(inputTerm, {
      idea: messages.ideaNewMetaTitle1,
      option: messages.optionMetaTitle1,
      project: messages.projectMetaTitle1,
      question: messages.questionMetaTitle1,
      issue: messages.issueMetaTitle1,
      contribution: messages.contributionMetaTitle1,
      proposal: messages.proposalMetaTitle1,
      initiative: messages.initiativeMetaTitle1,
      petition: messages.petitionMetaTitle1,
    })
  );
  const ideasIndexDescription = formatMessage(messages.ideaNewMetaDescription);

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
      {project && project.data.attributes.listed && (
        <meta name="robots" content="noindex" />
      )}
    </Helmet>
  );
};

export default IdeasNewMeta;
