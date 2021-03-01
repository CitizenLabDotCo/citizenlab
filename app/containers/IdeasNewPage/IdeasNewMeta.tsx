// libraries
import React from 'react';
import { Helmet } from 'react-helmet';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { InjectedIntlProps } from 'react-intl';
import { getInputTermMessage } from 'utils/i18n';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';

// utils
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
import { withRouter, WithRouterProps } from 'react-router';

// services
import { getInputTerm } from 'services/participationContexts';

interface InputProps {}

interface DataProps {
  authUser: GetAuthUserChildProps;
  locales: GetAppConfigurationLocalesChildProps;
  project: GetProjectChildProps;
  phases: GetPhasesChildProps;
}

interface Props
  extends InputProps,
    DataProps,
    InjectedIntlProps,
    InjectedLocalized {}

const IdeasNewMeta = React.memo<Props>(
  ({
    authUser,
    locales,
    project,
    localize,
    intl: { formatMessage },
    phases,
  }) => {
    const { location } = window;

    if (!isNilOrError(project)) {
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

export default withRouter<InputProps>(
  (inputProps: InputProps & WithRouterProps) => (
    <Data {...inputProps}>
      {(dataprops) => <IdeasNewMetaWithHoc {...inputProps} {...dataprops} />}
    </Data>
  )
);
