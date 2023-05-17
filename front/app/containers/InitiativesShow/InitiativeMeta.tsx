// libraries
import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';
import { Helmet } from 'react-helmet';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetInitiativeImages, {
  GetInitiativeImagesChildProps,
} from 'resources/GetInitiativeImages';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// utils
import { stripHtml } from 'utils/textUtils';
import { isNilOrError } from 'utils/helperUtils';
import { imageSizes } from 'utils/fileUtils';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useUserById from 'api/users/useUserById';

interface InputProps {
  initiativeId: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetAppConfigurationChildProps;
  authUser: GetAuthUserChildProps;
  initiativeImages: GetInitiativeImagesChildProps;
}

interface Props extends InputProps, DataProps {}

const InitiativeMeta = memo<Props & WrappedComponentProps & InjectedLocalized>(
  ({
    locale,
    tenant,
    authUser,
    initiativeImages,
    localize,
    intl: { formatMessage },
    initiativeId,
  }) => {
    const { data: initiative } = useInitiativeById(initiativeId);
    const authorId = get(initiative, 'data.relationships.author.data.id');
    const { data: author } = useUserById(authorId);

    if (isNilOrError(locale) || isNilOrError(tenant) || !initiative) {
      return null;
    }

    const { title_multiloc, body_multiloc } = initiative.data.attributes;
    const tenantLocales = tenant.attributes.settings.core.locales;
    const localizedTitle = localize(title_multiloc, { maxChar: 50 });
    const initiativeTitle = formatMessage(messages.metaTitle, {
      initiativeTitle: localizedTitle,
    });
    const initiativeDescription = stripHtml(localize(body_multiloc), 250);
    const initiativeImage =
      !isNilOrError(initiativeImages) && initiativeImages.length > 0
        ? initiativeImages[0].attributes.versions.fb
        : null;
    const initiativeUrl = window.location.href;
    const initiativeOgTitle = formatMessage(messages.metaOgTitle, {
      initiativeTitle: localizedTitle,
    });
    const initiativeAuthorName = author
      ? `${author.data.attributes.first_name} ${author.data.attributes.last_name}`
      : 'anonymous';

    const articleJson = {
      '@type': 'Article',
      image: initiativeImage,
      headline: initiativeTitle,
      author: initiativeAuthorName,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': initiativeUrl,
      },
      datePublished: initiative.data.attributes.published_at,
    };

    const json = {
      '@context': 'http://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@id': tenant.attributes.host,
            name: tenant.attributes.name,
            image: tenant.attributes.logo ? tenant.attributes.logo.large : null,
          },
        },
        {
          '@type': 'ListItem',
          position: 4,
          item: {
            '@id': `${tenant.attributes.host}/initiatives`,
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
            authUser && authUser.attributes.unread_notifications
              ? `(${authUser.attributes.unread_notifications}) `
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
  }
);

const Data = adopt<DataProps, InputProps>({
  initiativeImages: ({ initiativeId, render }) => (
    <GetInitiativeImages initiativeId={initiativeId}>
      {render}
    </GetInitiativeImages>
  ),
  locale: <GetLocale />,
  tenant: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
});

const InitiativeMetaWithHoc = injectIntl(
  injectLocalize<Props & WrappedComponentProps>(InitiativeMeta)
);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <InitiativeMetaWithHoc {...inputProps} {...dataProps} />}
  </Data>
);
