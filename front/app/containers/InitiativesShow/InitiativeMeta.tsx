// libraries
import React from 'react';
import { Helmet } from 'react-helmet';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { getFullName, stripHtml } from 'utils/textUtils';
import { isNilOrError } from 'utils/helperUtils';
import { imageSizes } from 'utils/fileUtils';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useUserById from 'api/users/useUserById';
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';
import useInitiativeImages from 'api/initiative_images/useInitiativeImages';
import useLocalize from 'hooks/useLocalize';

interface Props {
  initiativeId: string;
}

const InitiativeMeta = ({ initiativeId }: Props) => {
  const { data: initiative } = useInitiativeById(initiativeId);
  const locale = useLocale();
  const { data: appConfiguration } = useAppConfiguration();
  const { data: authUser } = useAuthUser();
  const { data: initiativeImages } = useInitiativeImages(initiativeId);
  const authorId = initiative?.data.relationships.author.data?.id;
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: author } = useUserById(authorId);

  if (isNilOrError(locale) || isNilOrError(appConfiguration) || !initiative) {
    return null;
  }

  const { title_multiloc, body_multiloc } = initiative.data.attributes;
  const tenantLocales = appConfiguration.data.attributes.settings.core.locales;
  const localizedTitle = localize(title_multiloc, { maxChar: 50 });
  const initiativeTitle = formatMessage(messages.metaTitle, {
    initiativeTitle: localizedTitle,
  });
  const initiativeDescription = stripHtml(localize(body_multiloc), 250);
  const initiativeImage =
    !isNilOrError(initiativeImages) && initiativeImages.data.length > 0
      ? initiativeImages.data[0].attributes.versions.fb
      : null;
  const initiativeUrl = window.location.href;
  const initiativeOgTitle = formatMessage(messages.metaOgTitle, {
    initiativeTitle: localizedTitle,
  });
  const initiativeAuthorName = author ? getFullName(author.data) : 'anonymous';

  const articleJson = {
    '@type': 'Article',
    image: initiativeImage,
    headline: initiativeTitle,
    author: initiativeAuthorName,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': initiativeUrl,
    },
    datePublished: initiative.data.attributes.proposed_at,
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
        position: 4,
        item: {
          '@id': `${appConfiguration.data.attributes.host}/initiatives`,
          name: 'Initiatives',
        },
      },
    ],
  };

  return (
    <Helmet>
      <title>
        {`
          ${
            authUser && authUser.data.attributes.unread_notifications
              ? `(${authUser.data.attributes.unread_notifications}) `
              : ''
          }
          ${initiativeTitle}`}
      </title>
      {getCanonicalLink()}
      {getAlternateLinks(tenantLocales)}
      <meta name="title" content={initiativeTitle} />
      <meta name="description" content={initiativeDescription} />

      <meta property="og:type" content="article" />
      <meta property="og:title" content={initiativeOgTitle} />
      <meta
        property="og:description"
        content={formatMessage(messages.initiativeOgDescription)}
      />
      {initiativeImage && (
        <meta property="og:image" content={initiativeImage} />
      )}
      <meta
        property="og:image:width"
        content={`${imageSizes.initiativeImg.fb[0]}`}
      />
      <meta
        property="og:image:height"
        content={`${imageSizes.initiativeImg.fb[1]}`}
      />

      <meta name="twitter:title" content={initiativeOgTitle} />
      <meta
        name="twitter:description"
        content={formatMessage(messages.initiativeOgDescription)}
      />
      {initiativeImage && (
        <meta name="twitter:image" content={initiativeImage} />
      )}
      <meta name="twitter:card" content="summary_large_image" />

      {initiativeImage && (
        <script type="application/ld+json">
          {JSON.stringify(articleJson)}
        </script>
      )}
      <script type="application/ld+json">{JSON.stringify(json)}</script>

      <meta property="og:url" content={initiativeUrl} />
      <meta property="og:locale" content={locale} />
    </Helmet>
  );
};

export default InitiativeMeta;
