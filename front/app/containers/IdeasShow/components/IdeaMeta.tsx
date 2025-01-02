import React from 'react';

import { Helmet } from 'react-helmet-async';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useIdeaImages from 'api/idea_images/useIdeaImages';
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'api/me/useAuthUser';
import useProjectById from 'api/projects/useProjectById';
import useUserById from 'api/users/useUserById';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
import { imageSizes } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';
import { getFullName, stripHtml } from 'utils/textUtils';

import messages from './messages';

interface Props {
  ideaId: string;
}

const IdeaMeta = ({ ideaId }: Props) => {
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const { data: appConfiguration } = useAppConfiguration();
  const { data: idea } = useIdeaById(ideaId);
  const { data: ideaImages } = useIdeaImages(ideaId);
  const { data: author } = useUserById(
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    idea?.data.relationships?.author?.data?.id
  );
  const { data: project } = useProjectById(
    idea?.data.relationships.project.data.id
  );
  const localize = useLocalize();

  if (!isNilOrError(locale) && appConfiguration && idea) {
    const { title_multiloc, body_multiloc } = idea.data.attributes;
    const appConfigurationLocales =
      appConfiguration.data.attributes.settings.core.locales;
    const localizedTitle = formatMessage(messages.metaTitle, {
      inputTitle: localize(title_multiloc, { maxChar: 50 }),
    });
    const ideaDescription = stripHtml(localize(body_multiloc), 250);

    const ideaImage =
      ideaImages && ideaImages.data.length > 0
        ? ideaImages.data[0].attributes.versions.fb
        : null;
    const ideaUrl = window.location.href;
    const projectTitle =
      project &&
      localize(project.data.attributes.title_multiloc, { maxChar: 20 });
    const projectSlug = project && project.data.attributes.slug;
    const ideaAuthorName = author ? getFullName(author.data) : 'anonymous';

    const articleJson = {
      '@type': 'Article',
      image: ideaImage,
      headline: localizedTitle,
      author: ideaAuthorName,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': ideaUrl,
      },
      datePublished: idea.data.attributes.published_at,
    };

    const json = {
      '@context': 'http://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@id': appConfiguration.data.attributes.host,
            name: appConfiguration.data.attributes.name,
            image: appConfiguration.data.attributes.logo
              ? appConfiguration.data.attributes.logo.large
              : null,
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@id': `${appConfiguration.data.attributes.host}/projects`,
            name: 'Projects',
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@id': `${appConfiguration.data.attributes.host}/projects/${projectSlug}`,
            name: projectTitle,
          },
        },
        {
          '@type': 'ListItem',
          position: 4,
          item: {
            '@id': `${appConfiguration.data.attributes.host}/ideas`,
            name: 'Ideas',
          },
        },
      ],
    };

    return (
      <Helmet>
        <title>
          {`
            ${
              !isNilOrError(authUser) &&
              authUser.data.attributes.unread_notifications
                ? `(${authUser.data.attributes.unread_notifications}) `
                : ''
            }
            ${localizedTitle}`}
        </title>
        {getCanonicalLink()}
        {getAlternateLinks(appConfigurationLocales)}
        <meta name="title" content={localizedTitle} />
        <meta name="description" content={ideaDescription} />
        <meta property="og:description" content={ideaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={localizedTitle} />
        <meta property="ideaOgDescription" content={ideaDescription} />
        {ideaImage && <meta property="og:image" content={ideaImage} />}
        <meta
          property="og:image:width"
          content={`${imageSizes.ideaImg.fb[0]}`}
        />
        <meta
          property="og:image:height"
          content={`${imageSizes.ideaImg.fb[1]}`}
        />

        <meta name="twitter:title" content={localizedTitle} />
        <meta name="twitter:description" content={ideaDescription} />
        {ideaImage && <meta name="twitter:image" content={ideaImage} />}
        <meta name="twitter:card" content="summary_large_image" />

        {ideaImage && (
          <script type="application/ld+json">
            {JSON.stringify(articleJson)}
          </script>
        )}
        <script type="application/ld+json">{JSON.stringify(json)}</script>

        <meta property="og:url" content={ideaUrl} />
        <meta property="og:locale" content={locale} />
      </Helmet>
    );
  }

  return null;
};

export default IdeaMeta;
