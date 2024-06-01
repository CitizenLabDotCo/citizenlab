import React from 'react';

import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';

import useAuthUser from 'api/me/useAuthUser';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

import messages from './messages';

const IdeasNewSurveyMeta = () => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { slug } = useParams();
  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectBySlug(slug);
  const locales = useAppConfigurationLocales();
  const { location } = window;

  if (project) {
    const projectName = localize(project.data.attributes.title_multiloc);
    const ideasIndexTitle = formatMessage(messages.surveyNewMetaTitle1);
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

export default IdeasNewSurveyMeta;
