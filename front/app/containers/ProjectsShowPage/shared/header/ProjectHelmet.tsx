import React, { memo } from 'react';
// components
import { Helmet } from 'react-helmet';
import { WrappedComponentProps } from 'react-intl';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useAuthUser from 'hooks/useAuthUser';
// hooks
import useLocale from 'hooks/useLocale';
// typings
import { IProjectData } from 'services/projects';
import { injectIntl } from 'utils/cl-intl';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
import { imageSizes } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';
// i18n
import { getLocalized } from 'utils/i18n';
// utils
import { stripHtml } from 'utils/textUtils';
import messages from 'containers/ProjectsShowPage/messages';

interface Props {
  project: IProjectData;
}

const ProjectHelmet = memo<Props & WrappedComponentProps>(
  ({ project, intl }) => {
    const locale = useLocale();
    const tenantLocales = useAppConfigurationLocales();
    const authUser = useAuthUser();

    if (
      !isNilOrError(locale) &&
      !isNilOrError(tenantLocales) &&
      project.attributes
    ) {
      const { formatMessage } = intl;
      const metaTitle = formatMessage(messages.metaTitle, {
        projectTitle: getLocalized(
          project.attributes.title_multiloc,
          locale,
          tenantLocales,
          50
        ),
      });
      const description = stripHtml(
        getLocalized(
          project.attributes.description_multiloc,
          locale,
          tenantLocales
        ),
        250
      );
      const image = project.attributes.header_bg.large;
      const { location } = window;

      return (
        <Helmet>
          <title>
            {`${
              !isNilOrError(authUser) &&
              authUser.attributes.unread_notifications
                ? `(${authUser.attributes.unread_notifications}) `
                : ''
            }
            ${metaTitle}`}
          </title>
          {getCanonicalLink()}
          {getAlternateLinks(tenantLocales)}
          <meta name="title" content={metaTitle} />
          <meta name="description" content={description} />
          <meta property="og:title" content={metaTitle} />
          <meta property="og:description" content={description} />
          {image && <meta property="og:image" content={image} />}
          <meta
            property="og:image:width"
            content={`${imageSizes.projectBg.large[0]}`}
          />
          <meta
            property="og:image:height"
            content={`${imageSizes.projectBg.large[1]}`}
          />
          <meta property="og:url" content={location.href} />
          <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
      );
    }

    return null;
  }
);

const ProjectHelmetWithHoC = injectIntl(ProjectHelmet);

export default ProjectHelmetWithHoC;
