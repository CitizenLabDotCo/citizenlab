// libraries
import React from 'react';
import { adopt } from 'react-adopt';
import { Helmet } from 'react-helmet';
import { WrappedComponentProps } from 'react-intl';
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';
// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import { injectIntl } from 'utils/cl-intl';
// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
// i18n
import messages from './messages';

interface InputProps {}

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenantLocales: GetAppConfigurationLocalesChildProps;
}

interface Props extends InputProps, DataProps {}

const ProjectsMeta = React.memo<Props & WrappedComponentProps>(
  ({ intl, authUser, tenantLocales }) => {
    const { formatMessage } = intl;
    const { location } = window;
    const projectsIndexTitle = formatMessage(messages.metaTitle);
    const projectsIndexDescription = formatMessage(messages.metaDescription);

    return (
      <Helmet>
        <title>
          {`
          ${
            authUser && authUser.attributes.unread_notifications
              ? `(${authUser.attributes.unread_notifications}) `
              : ''
          }
          ${projectsIndexTitle}`}
        </title>
        {getCanonicalLink()}
        {getAlternateLinks(tenantLocales)}
        <meta name="title" content={projectsIndexTitle} />
        <meta name="description" content={projectsIndexDescription} />
        <meta property="og:title" content={projectsIndexTitle} />
        <meta property="og:description" content={projectsIndexDescription} />
        <meta property="og:url" content={location.href} />
      </Helmet>
    );
  }
);

const ProjectsMetaWithHoc = injectIntl(ProjectsMeta);

const Data = adopt<DataProps, InputProps>({
  tenantLocales: <GetAppConfigurationLocales />,
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => <ProjectsMetaWithHoc {...inputProps} {...dataprops} />}
  </Data>
);
