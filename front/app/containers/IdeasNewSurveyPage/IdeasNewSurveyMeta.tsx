import React from 'react';

import { Helmet } from 'react-helmet-async';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { useIntl } from 'utils/cl-intl';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

import messages from './messages';

interface Props {
  surveyTitle: string;
}

const IdeasNewSurveyMeta = ({ surveyTitle }: Props) => {
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
    </Helmet>
  );
};

export default IdeasNewSurveyMeta;
