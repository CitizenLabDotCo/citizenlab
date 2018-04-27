import React from 'react';
import { isNullOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import Helmet from 'react-helmet';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetProjectImages, { GetProjectImagesChildProps } from 'resources/GetProjectImages';

// utils
import { stripHtml } from 'utils/textUtils';

// i18n
import { getLocalized } from 'utils/i18n';

interface InputProps {
  projectSlug: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenantLocales: GetTenantLocalesChildProps;
  project: GetProjectChildProps;
  projectImages: GetProjectImagesChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class Meta extends React.PureComponent<Props, State> {
  render() {
    const { locale, tenantLocales, project, projectImages } = this.props;

    if (locale && tenantLocales && !isNullOrError(project)) {
      const title = getLocalized(project.attributes.title_multiloc, locale, tenantLocales);
      const description = stripHtml(getLocalized(project.attributes.description_multiloc, locale, tenantLocales));
      const image = (projectImages && projectImages && projectImages.length > 0 ? projectImages[0].attributes.versions.large : null);
      const url = window.location.href;

      return (
        <Helmet>
          <title>{title}</title>
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          {image && <meta property="og:image" content={image} />}
          <meta property="og:url" content={url} />
          <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale/>,
  tenantLocales: <GetTenantLocales/>,
  project: ({ projectSlug, render }) => <GetProject slug={projectSlug}>{render}</GetProject>,
  projectImages: ({ project, render }) => <GetProjectImages projectId={(!isNullOrError(project) ? project.id : null)}>{render}</GetProjectImages>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <Meta {...inputProps} {...dataProps} />}
  </Data>
);
