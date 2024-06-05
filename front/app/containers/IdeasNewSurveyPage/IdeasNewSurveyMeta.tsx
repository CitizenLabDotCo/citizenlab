import React from 'react';

import { Helmet } from 'react-helmet';

import useAuthUser from 'api/me/useAuthUser';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { useIntl } from 'utils/cl-intl';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

import ideationMessages from '../IdeasNewPage/messages';

import messages from './messages';

const IdeasNewSurveyMeta = () => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const locales = useAppConfigurationLocales();
  const { location } = window;

  const ideasIndexTitle = formatMessage(messages.surveyNewMetaTitle1);
  const ideasIndexDescription = formatMessage(
    ideationMessages.ideaNewMetaDescription
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
};

export default IdeasNewSurveyMeta;
