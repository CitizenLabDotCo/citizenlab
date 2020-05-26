import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import { Helmet } from 'react-helmet';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import GetProjectFolder, { GetProjectFolderChildProps } from 'resources/GetProjectFolder';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// utils
import { stripHtml } from 'utils/textUtils';
import { imageSizes } from 'utils/fileTools';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';

// i18n
import { getLocalized } from 'utils/i18n';
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

interface InputProps {
  projectFolderSlug: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenantLocales: GetTenantLocalesChildProps;
  projectFolder: GetProjectFolderChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps { }

const Meta: React.SFC<Props & InjectedIntlProps> = memo(({ locale, tenantLocales, projectFolder, authUser, intl }) => {

  if (!isNilOrError(locale) && !isNilOrError(tenantLocales) && !isNilOrError(projectFolder) && projectFolder.attributes) {
    const { formatMessage } = intl;
    const metaTitle = formatMessage(messages.metaTitle, { title: getLocalized(projectFolder.attributes.title_multiloc, locale, tenantLocales, 50) });
    const description = stripHtml(getLocalized(projectFolder.attributes.description_multiloc, locale, tenantLocales), 250);
    const image = projectFolder.attributes.header_bg?.large;
    const { location } = window;

    return (
      <Helmet>
        <title>
          {`${(authUser && authUser.attributes.unread_notifications) ? `(${authUser.attributes.unread_notifications}) ` : ''}
            ${metaTitle}`}
        </title>
        {getCanonicalLink()}
        {getAlternateLinks(tenantLocales)}
        <meta name="title" content={metaTitle} />
        <meta name="description" content={description} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={description} />
        {image && <meta property="og:image" content={image} />}
        <meta property="og:image:width" content={`${imageSizes.projectBg.large[0]}`} />
        <meta property="og:image:height" content={`${imageSizes.projectBg.large[1]}`} />
        <meta property="og:url" content={location.href} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
    );
  }

  return null;

});

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenantLocales: <GetTenantLocales />,
  projectFolder: ({ projectFolderSlug, render }) => <GetProjectFolder projectFolderSlug={projectFolderSlug}>{render}</GetProjectFolder>,
  authUser: <GetAuthUser />,
});

const MetaWithHoc = injectIntl<Props>(Meta);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <MetaWithHoc {...inputProps} {...dataProps} />}
  </Data>
);
