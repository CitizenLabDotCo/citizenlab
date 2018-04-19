// libraries
import React, { SFC } from 'react';
import { adopt } from 'react-adopt';
import Helmet from 'react-helmet';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetIdeaImages, { GetIdeaImagesChildProps } from 'resources/GetIdeaImages';

// i18n
import { getLocalized } from 'utils/i18n';

// utils
import { stripHtml } from 'utils/textUtils';

interface InputProps {
  ideaId: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenantLocales: GetTenantLocalesChildProps;
  idea: GetIdeaChildProps;
  ideaImages: GetIdeaImagesChildProps;
}

interface Props extends InputProps, DataProps {}

const IdeaMeta: SFC<Props> = ({ locale, tenantLocales, idea, ideaImages }) => {
  if (locale && tenantLocales && idea) {
    const ideaTitle = getLocalized(idea.attributes.title_multiloc, locale, tenantLocales);
    const ideaDescription = getLocalized(idea.attributes.body_multiloc, locale, tenantLocales);
    const ideaImage = (ideaImages && ideaImages.length > 0 ? ideaImages[0].attributes.versions.large : null);
    const ideaUrl = window.location.href;

    return (
      <Helmet>
        <title>{ideaTitle}</title>
        <meta property="og:title" content={ideaTitle} />
        <meta property="og:description" content={stripHtml(ideaDescription)} />
        {ideaImage && <meta property="og:image" content={ideaImage} />}
        <meta property="og:url" content={ideaUrl} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
    );
  }

  return null;
};

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenantLocales: <GetTenantLocales />,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  ideaImages: ({ ideaId, render }) => <GetIdeaImages ideaId={ideaId}>{render}</GetIdeaImages>
});

export default (inputProps: InputProps) => {
  return (
    <Data {...inputProps}>
      {dataProps => <IdeaMeta {...inputProps} {...dataProps} />}
    </Data>
  );
};
