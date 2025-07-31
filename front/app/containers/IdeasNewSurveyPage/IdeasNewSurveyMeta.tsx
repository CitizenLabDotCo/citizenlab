import React from 'react';

import { Helmet } from 'react-helmet-async';

import { IProject } from 'api/projects/types';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { useIntl } from 'utils/cl-intl';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

import messages from './messages';

interface Props {
  surveyTitle: string;
  project: IProject;
}

const IdeasNewSurveyMeta = ({ project, surveyTitle }: Props) => {
  const { formatMessage } = useIntl();
  const locales = useAppConfigurationLocales();
  const { location } = window;
  const title = formatMessage(messages.surveyNewMetaTitle, {
    surveyTitle,
  });

  return (
    <Helmet>
      <title>{title}</title>
      {getAlternateLinks(locales)}
      {getCanonicalLink()}
      <meta name="title" content={title} />
      <meta property="og:title" content={title} />
      <meta property="og:url" content={location.href} />
      {project.data.attributes.listed && (
        <meta name="robots" content="noindex" />
      )}
    </Helmet>
  );
};

export default IdeasNewSurveyMeta;
