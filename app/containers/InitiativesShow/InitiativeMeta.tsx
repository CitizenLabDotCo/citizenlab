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
import GetInitiative, {
  GetInitiativeChildProps,
} from 'resources/GetInitiative';
import GetUser, { GetUserChildProps } from 'resources/GetUser';
import GetInitiativeImages, {
  GetInitiativeImagesChildProps,
} from 'resources/GetInitiativeImages';

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
  initiativeId: string;
}

interface DataProps {
  initiative: GetInitiativeChildProps;
  author: GetUserChildProps;
  locale: GetLocaleChildProps;
  tenant: GetAppConfigurationChildProps;
  authUser: GetAuthUserChildProps;
  initiativeImages: GetInitiativeImagesChildProps;
}

interface Props extends InputProps, DataProps {}

const InitiativeMeta = memo<Props & InjectedIntlProps & InjectedLocalized>(
  ({
    initiative,
    locale,
    tenant,
    authUser,
    initiativeImages,
    author,
    localize,
    intl: { formatMessage },
  }) => {
    if (
      !isNilOrError(locale) &&
      !isNilOrError(tenant) &&
      !isNilOrError(initiative)
    ) {
      const { title_multiloc, body_multiloc } = initiative.attributes;
      const tenantLocales = tenant.attributes.settings.core.locales;
      const localizedTitle = localize(title_multiloc, 50);
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
      const initiativeAuthorName = !isNilOrError(author)
        ? `${author.attributes.first_name} ${author.attributes.last_name}`
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
        datePublished: initiative.attributes.published_at,
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
              image: tenant.attributes.logo
                ? tenant.attributes.logo.large
                : null,
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

    return null;
  }
);

const Data = adopt<DataProps, InputProps>({
  initiative: ({ initiativeId, render }) => (
    <GetInitiative id={initiativeId}>{render}</GetInitiative>
  ),
  initiativeImages: ({ initiativeId, render }) => (
    <GetInitiativeImages initiativeId={initiativeId}>
      {render}
    </GetInitiativeImages>
  ),
  author: ({ initiative, render }) => (
    <GetUser id={get(initiative, 'relationships.author.data.id', null)}>
      {render}
    </GetUser>
  ),
  locale: <GetLocale />,
  tenant: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
});

const InitiativeMetaWithHoc = injectIntl<Props>(
  injectLocalize<Props & InjectedIntlProps>(InitiativeMeta)
);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <InitiativeMetaWithHoc {...inputProps} {...dataProps} />}
  </Data>
);
