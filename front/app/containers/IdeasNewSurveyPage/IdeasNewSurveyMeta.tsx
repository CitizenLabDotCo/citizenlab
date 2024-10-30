import React from 'react';

import { Helmet } from 'react-helmet';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

interface Props {
  surveyTitle: string;
}

const IdeasNewSurveyMeta = ({ surveyTitle }: Props) => {
  const locales = useAppConfigurationLocales();
  const { location } = window;

  return (
    <Helmet>
      <title>{surveyTitle}</title>
      {getAlternateLinks(locales)}
      {getCanonicalLink()}
      <meta name="title" content={surveyTitle} />
      <meta property="og:title" content={surveyTitle} />
      <meta property="og:url" content={location.href} />
    </Helmet>
  );
};

export default IdeasNewSurveyMeta;
