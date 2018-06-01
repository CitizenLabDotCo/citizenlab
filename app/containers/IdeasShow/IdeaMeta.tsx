// libraries
import React from 'react';
import { adopt } from 'react-adopt';
import Helmet from 'react-helmet';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetIdeaImages, { GetIdeaImagesChildProps } from 'resources/GetIdeaImages';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// i18n
import { getLocalized } from 'utils/i18n';
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// utils
import { stripHtml } from 'utils/textUtils';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  ideaId: string;
  ideaAuthorName: string | null;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetTenantChildProps;
  idea: GetIdeaChildProps;
  ideaImages: GetIdeaImagesChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps { }

const IdeaMeta: React.SFC<Props & InjectedIntlProps> = ({ locale, tenant, idea, ideaImages, authUser, intl, ideaAuthorName }) => {
  if (!isNilOrError(locale) && !isNilOrError(tenant) && !isNilOrError(idea)) {
    const { formatMessage } = intl;
    const tenantLocales = tenant.attributes.settings.core.locales;
    const ideaTitle = formatMessage(messages.metaTitle, { ideaTitle: getLocalized(idea.attributes.title_multiloc, locale, tenantLocales, 50) });
    const ideaDescription = stripHtml(getLocalized(idea.attributes.body_multiloc, locale, tenantLocales), 250);
    const ideaImage = (ideaImages && ideaImages.length > 0 ? (ideaImages[0].attributes.versions.large || ideaImages[0].attributes.versions.medium) : null);
    const ideaUrl = window.location.href;

    const ideaOgTitle = formatMessage(messages.metaOgTitle, { ideaTitle: getLocalized(idea.attributes.title_multiloc, locale, tenantLocales, 50) });

    const json = (ideaImage) ? {
      '@context': 'http://schema.org',
      '@type': 'Article',
      author: ideaAuthorName,
      headline: ideaTitle,
      publisher: {
        '@type': 'Organization',
        name: tenant.attributes.name,
        logo: tenant.attributes.logo.large
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': ideaUrl
      },
      datePublished: idea.attributes.published_at,
      image: ideaImage,
    } : {
        '@context': 'http://schema.org',
        '@type': 'Article',
        author: ideaAuthorName,
        headline: ideaTitle,
        publisher: {
          '@type': 'Organization',
          name: tenant.attributes.name,
          logo: tenant.attributes.logo.large
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': ideaUrl
        },
        datePublished: idea.attributes.published_at,
      };

    return (
      <Helmet>
        <title>
          {`
            ${(authUser && authUser.attributes.unread_notifications) ? `(${authUser.attributes.unread_notifications}) ` : ''}
            ${ideaTitle}`
          }
        </title>
        <meta name="title" content={ideaTitle} />
        <meta name="description" content={ideaDescription} />

        <meta name="og:type" content="article" />
        <meta property="og:title" content={ideaOgTitle} />
        <meta property="og:description" content={formatMessage(messages.ideaOgDescription)} />
        {ideaImage && <meta property="og:image" content={ideaImage} />}
        <meta property="og:url" content={ideaUrl} />
        <meta property="og:locale" content={locale} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify(json)}
        </script>
      </Helmet>
    );
  }

  return null;
};

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetTenant />,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  ideaImages: ({ ideaId, render }) => <GetIdeaImages ideaId={ideaId}>{render}</GetIdeaImages>,
  authUser: <GetAuthUser />,
});

const IdeaMetaWithHoc = injectIntl<Props>(IdeaMeta);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaMetaWithHoc {...inputProps} {...dataProps} />}
  </Data>
);
