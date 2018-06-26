// libraries
import React from 'react';
import { adopt } from 'react-adopt';
import Helmet from 'react-helmet';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// i18n
import { getLocalized } from 'utils/i18n';
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// utils
import { stripHtml } from 'utils/textUtils';
import { isNilOrError } from 'utils/helperUtils';
import { imageSizes } from 'utils/imageTools';

// Typings
import { Multiloc } from 'typings';
import { IIdeaImage } from 'services/ideaImages';

interface InputProps {
  ideaId: string;
  titleMultiloc: Multiloc;
  bodyMultiloc: Multiloc;
  ideaAuthorName: string | null;
  ideaImages: IIdeaImage | null;
  publishedAt: string;
  projectTitle: Multiloc | null;
  projectSlug: string | null;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetTenantChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps { }

const IdeaMeta: React.SFC<Props & InjectedIntlProps> = ({
  locale,
  tenant,
  authUser,
  titleMultiloc,
  bodyMultiloc,
  ideaImages,
  ideaAuthorName,
  publishedAt,
  projectTitle,
  projectSlug,
  intl,
}) => {
  if (!isNilOrError(locale) && !isNilOrError(tenant)) {
    const { formatMessage } = intl;
    const tenantLocales = tenant.attributes.settings.core.locales;
    const ideaTitle = formatMessage(messages.metaTitle, { ideaTitle: getLocalized(titleMultiloc, locale, tenantLocales, 50) });
    const ideaDescription = stripHtml(getLocalized(bodyMultiloc, locale, tenantLocales), 250);
    const ideaImage = ideaImages ? ideaImages.data.attributes.versions.medium : null;
    const ideaUrl = window.location.href;
    const project = getLocalized(projectTitle, locale, tenantLocales, 20);

    const ideaOgTitle = formatMessage(messages.metaOgTitle, { ideaTitle: getLocalized(titleMultiloc, locale, tenantLocales, 50) });

    const articleJson = {
      '@type': 'Article',
      image: ideaImage,
      headline: ideaTitle,
      author: ideaAuthorName,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': ideaUrl
      },
      datePublished: publishedAt,
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
          image: tenant.attributes.logo.large
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
          name: project,
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
        <meta name="title" content={ideaTitle} />
        <meta name="description" content={ideaDescription} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={ideaOgTitle} />
        <meta property="og:description" content={formatMessage(messages.ideaOgDescription)} />
        {ideaImage &&
          <>
            <meta property="og:image" content={ideaImage} />
            <meta property="og:image:width" content={`${imageSizes.ideaImg.medium[0]}`} />
            <meta property="og:image:height" content={`${imageSizes.ideaImg.medium[1]}`} />
          </>
        }
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
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
    );
  }

  return null;
};

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetTenant />,
  authUser: <GetAuthUser />,
});

const IdeaMetaWithHoc = injectIntl<Props>(IdeaMeta);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaMetaWithHoc {...inputProps} {...dataProps} />}
  </Data>
);
