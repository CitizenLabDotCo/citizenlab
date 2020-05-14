// libraries
import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';
import Helmet from 'react-helmet';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetUser, { GetUserChildProps } from 'resources/GetUser';
import GetIdeaImages, { GetIdeaImagesChildProps } from 'resources/GetIdeaImages';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// utils
import { stripHtml } from 'utils/textUtils';
import { isNilOrError } from 'utils/helperUtils';
import { imageSizes } from 'utils/fileTools';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

interface InputProps {
  ideaId: string;
}

interface DataProps {
  idea: GetIdeaChildProps;
  project: GetProjectChildProps;
  author: GetUserChildProps;
  locale: GetLocaleChildProps;
  tenant: GetTenantChildProps;
  authUser: GetAuthUserChildProps;
  ideaImages: GetIdeaImagesChildProps;
}

interface Props extends InputProps, DataProps {}

const IdeaMeta = memo<Props & InjectedIntlProps & InjectedLocalized>(({
  idea,
  locale,
  tenant,
  authUser,
  ideaImages,
  author,
  project,
  localize,
  intl: { formatMessage }
}) => {
  if (!isNilOrError(locale) && !isNilOrError(tenant) && !isNilOrError(idea)) {
    const { title_multiloc, body_multiloc } = idea.attributes;
    const tenantLocales = tenant.attributes.settings.core.locales;
    const localizedTitle = localize(title_multiloc, 50);
    const ideaTitle = formatMessage(messages.metaTitle, { ideaTitle: localizedTitle });
    const ideaDescription = stripHtml(localize(body_multiloc), 250);
    const ideaImage = !isNilOrError(ideaImages) && ideaImages.length > 0 ? ideaImages[0].attributes.versions.fb : null;
    const ideaUrl = window.location.href;
    const projectTitle = !isNilOrError(project) && localize(project.attributes.title_multiloc, 20);
    const projectSlug = !isNilOrError(project) && project.attributes.slug;
    const ideaOgTitle = formatMessage(messages.metaOgTitle, { ideaTitle: localizedTitle });
    const ideaAuthorName = !isNilOrError(author) ? `${author.attributes.first_name} ${author.attributes.last_name}` : 'anonymous';

    const articleJson = {
      '@type': 'Article',
      image: ideaImage,
      headline: ideaTitle,
      author: ideaAuthorName,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': ideaUrl
      },
      datePublished: idea.attributes.published_at,
    };

    const json = {
      '@context': 'http://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [{
        '@type': 'ListItem',
        position: 1,
        item: {
          '@id': tenant.attributes.host,
          name: tenant.attributes.name,
          image: tenant.attributes.logo ? tenant.attributes.logo.large : null
        }
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@id': `${tenant.attributes.host}/projects`,
          name: 'Projects',
        }
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@id': `${tenant.attributes.host}/projects/${projectSlug}`,
          name: projectTitle,
        }
      },
      {
        '@type': 'ListItem',
        position: 4,
        item: {
          '@id': `${tenant.attributes.host}/ideas`,
          name: 'Ideas',
        }
      }]
    };

    return (
      <Helmet>
        <title>
          {`
            ${(authUser && authUser.attributes.unread_notifications) ? `(${authUser.attributes.unread_notifications}) ` : ''}
            ${ideaTitle}`
          }
        </title>
        {getCanonicalLink()}
        {getAlternateLinks(tenantLocales)}
        <meta name="title" content={ideaTitle} />
        <meta name="description" content={ideaDescription} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={ideaOgTitle} />
        <meta property="og:description" content={formatMessage(messages.ideaOgDescription)} />
        {ideaImage && <meta property="og:image" content={ideaImage} />}
        <meta property="og:image:width" content={`${imageSizes.ideaImg.fb[0]}`} />
        <meta property="og:image:height" content={`${imageSizes.ideaImg.fb[1]}`} />

        <meta name="twitter:title" content={ideaOgTitle} />
        <meta name="twitter:description" content={formatMessage(messages.ideaOgDescription)} />
        {ideaImage && <meta name="twitter:image" content={ideaImage} />}
        <meta name="twitter:card" content="summary_large_image" />

        {ideaImage &&
          <script type="application/ld+json">
            {JSON.stringify(articleJson)}
          </script>
        }
        <script type="application/ld+json">
          {JSON.stringify(json)}
        </script>

        <meta property="og:url" content={ideaUrl} />
        <meta property="og:locale" content={locale} />
      </Helmet>
    );
  }

  return null;
});

const Data = adopt<DataProps, InputProps>({
  idea: ({ ideaId, render }) => <GetIdea ideaId={ideaId}>{render}</GetIdea>,
  ideaImages: ({ ideaId, render }) => <GetIdeaImages ideaId={ideaId}>{render}</GetIdeaImages>,
  project: ({ idea, render }) => !isNilOrError(idea) ? <GetProject projectId={idea.relationships.project.data.id}>{render}</GetProject> : null,
  author: ({ idea, render }) => <GetUser id={get(idea, 'relationships.author.data.id', null)}>{render}</GetUser>,
  locale: <GetLocale />,
  tenant: <GetTenant />,
  authUser: <GetAuthUser />,
});

const IdeaMetaWithHoc = injectIntl<Props>(injectLocalize<Props & InjectedIntlProps>(IdeaMeta));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaMetaWithHoc {...inputProps} {...dataProps} />}
  </Data>
);
