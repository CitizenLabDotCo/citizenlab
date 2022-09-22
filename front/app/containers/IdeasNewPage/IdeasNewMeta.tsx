// libraries
import React from 'react';
import { adopt } from 'react-adopt';
import { Helmet } from 'react-helmet';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { getInputTermMessage } from 'utils/i18n';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';

// resources
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// services
import { getInputTerm } from 'services/participationContexts';

interface InputProps {}

interface DataProps {
  authUser: GetAuthUserChildProps;
  appConfig: GetAppConfigurationChildProps;
  locales: GetAppConfigurationLocalesChildProps;
  project: GetProjectChildProps;
  phases: GetPhasesChildProps;
}

interface Props
  extends InputProps,
    DataProps,
    WrappedComponentProps,
    InjectedLocalized {}

const IdeasNewMeta = React.memo<Props>(
  ({
    authUser,
    locales,
    project,
    localize,
    intl: { formatMessage },
    phases,
    appConfig,
  }) => {
    const { location } = window;

    if (!isNilOrError(project) && !isNilOrError(appConfig)) {
      const projectName = localize(project.attributes.title_multiloc);
      const inputTerm = getInputTerm(
        project.attributes.process_type,
        project,
        phases
      );
      const ideasIndexTitle = formatMessage(
        getInputTermMessage(inputTerm, {
          idea: messages.ideaNewMetaTitle,
          option: messages.optionMetaTitle,
          project: messages.projectMetaTitle,
          question: messages.questionMetaTitle,
          issue: messages.issueMetaTitle,
          contribution: messages.contributionMetaTitle,
        }),
        { projectName }
      );
      const ideasIndexDescription = formatMessage(
        messages.ideaNewMetaDescription,
        {
          projectName,
          orgName: localize(
            appConfig.attributes.settings.core.organization_name
          ),
        }
      );

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

    return null;
  }
);

const IdeasNewMetaWithHoc = injectIntl(injectLocalize(IdeasNewMeta));

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  appConfig: <GetAppConfiguration />,
  locales: <GetAppConfigurationLocales />,
  authUser: <GetAuthUser />,
  project: ({ params, render }) => (
    <GetProject projectSlug={params.slug}>{render}</GetProject>
  ),
  phases: ({ project, render }) => {
    return (
      <GetPhases projectId={!isNilOrError(project) ? project.id : null}>
        {render}
      </GetPhases>
    );
  },
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {(dataprops) => <IdeasNewMetaWithHoc {...inputProps} {...dataprops} />}
  </Data>
));
