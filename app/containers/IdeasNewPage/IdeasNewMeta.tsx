// libraries
import React from 'react';
import { Helmet } from 'react-helmet';
import { adopt } from 'react-adopt';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { InjectedIntlProps } from 'react-intl';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetTenantLocales, {
  GetTenantLocalesChildProps,
} from 'resources/GetTenantLocales';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {}

interface DataProps {
  authUser: GetAuthUserChildProps;
  locales: GetTenantLocalesChildProps;
  project: GetProjectChildProps;
}

interface Props
  extends InputProps,
    DataProps,
    InjectedIntlProps,
    InjectedLocalized {}

const IdeasNewMeta = React.memo<Props>(
  ({ intl, authUser, locales, project, localize }) => {
    const { formatMessage } = intl;
    const { location } = window;
    const projectName =
      !isNilOrError(project) && localize(project.attributes.title_multiloc);
    const ideasIndexTitle = formatMessage(messages.metaTitle, { projectName });
    const ideasIndexDescription = formatMessage(messages.metaDescription, {
      projectName,
    });

    return (
      <Helmet>
        <title>
          {`
          ${
            authUser && authUser.attributes.unread_notifications
              ? `(${authUser.attributes.unread_notifications}) `
              : ''
          }
          ${ideasIndexTitle}
        `}
        </title>
        {getAlternateLinks(locales)}
        {getCanonicalLink()}
        <meta name="title" content={ideasIndexTitle} />
        <meta name="description" content={ideasIndexDescription} />
        <meta property="og:title" content={ideasIndexTitle} />
        <meta property="og:description" content={ideasIndexDescription} />
        <meta property="og:url" content={location.href} />
      </Helmet>
    );
  }
);

const IdeasNewMetaWithHoc = injectIntl(injectLocalize(IdeasNewMeta));

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  locales: <GetTenantLocales />,
  authUser: <GetAuthUser />,
  project: ({ params, render }) => (
    <GetProject projectSlug={params.slug}>{render}</GetProject>
  ),
});

export default withRouter<InputProps>(
  (inputProps: InputProps & WithRouterProps) => (
    <Data {...inputProps}>
      {(dataprops) => <IdeasNewMetaWithHoc {...inputProps} {...dataprops} />}
    </Data>
  )
);
