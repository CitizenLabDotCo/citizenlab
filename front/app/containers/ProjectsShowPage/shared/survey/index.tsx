import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import TypeformSurvey from './TypeformSurvey';
import SurveymonkeySurvey from './SurveymonkeySurvey';
import GoogleFormsSurvey from './GoogleFormsSurvey';
import EnalyzerSurvey from './EnalyzerSurvey';
import Warning from 'components/UI/Warning';
import SignUpIn from 'components/SignUpIn';
import { ProjectPageSectionTitle } from 'containers/ProjectsShowPage/styles';

// services
import {
  getSurveyTakingRules,
  ISurveyTakingDisabledReason,
} from 'services/actionTakingRules';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// events
import { openVerificationModal } from 'components/Verification/verificationModalEvents';
import { openSignUpInModal } from 'components/SignUpIn/events';

// styling
import styled from 'styled-components';
import { defaultCardStyle, fontSizes, media } from 'utils/styleUtils';

const Container = styled.div`
  position: relative;

  &.enabled {
    min-height: 500px;
  }
`;

const SignUpInWrapper = styled.div`
  width: 100%;
  padding: 20px;
  padding-top: 45px;
  ${defaultCardStyle};

  ${media.smallerThanMinTablet`
    padding-top: 30px;
  `}
`;

const StyledSignUpIn = styled(SignUpIn)`
  width: 100%;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;

  & .signuphelpertext {
    display: none !important;
  }

  & .signupinheadercontainer {
    border-bottom: none !important;
  }

  & .signupincontentcontainer {
    max-height: unset !important;
  }
`;

const SignUpInHeader = styled.h2`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xxl}px;
  line-height: normal;
  font-weight: 500;
  margin: 0;
  padding: 0;

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.xl}px;
  `}
`;

interface InputProps {
  projectId: string | null;
  phaseId?: string | null;
  surveyEmbedUrl: string;
  surveyService: string;
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class Survey extends PureComponent<Props, State> {
  onVerify = () => {
    const { projectId, phaseId } = this.props;
    const pcId = phaseId || projectId;
    const pcType = phaseId ? 'phase' : 'project';

    if (pcId && pcType) {
      openVerificationModal({
        context: {
          action: 'taking_survey',
          id: pcId,
          type: pcType,
        },
      });
    }
  };

  signUpIn = (flow: 'signin' | 'signup') => {
    const { phaseId, project, projectId } = this.props;

    if (!isNilOrError(project)) {
      const pcId = phaseId || projectId;
      const pcType = phaseId ? 'phase' : 'project';
      const takingSurveyDisabledReason =
        project.attributes?.action_descriptor?.taking_survey?.disabled_reason;

      openSignUpInModal({
        flow,
        verification: takingSurveyDisabledReason === 'not_verified',
        verificationContext: !!(
          takingSurveyDisabledReason === 'not_verified' &&
          pcId &&
          pcType
        )
          ? {
              action: 'taking_survey',
              id: pcId,
              type: pcType,
            }
          : undefined,
      });
    }
  };

  signIn = () => {
    this.signUpIn('signin');
  };

  signUp = () => {
    this.signUpIn('signup');
  };

  noOp = () => {};

  disabledMessage: {
    [key in ISurveyTakingDisabledReason]: ReactIntl.FormattedMessage.MessageDescriptor;
  } = {
    projectInactive: messages.surveyDisabledProjectInactive,
    maybeNotPermitted: messages.surveyDisabledMaybeNotPermitted,
    maybeNotVerified: messages.surveyDisabledMaybeNotVerified,
    notPermitted: messages.surveyDisabledNotPermitted,
    notActivePhase: messages.surveyDisabledNotActivePhase,
    notVerified: messages.surveyDisabledNotVerified,
  };

  render() {
    const {
      surveyEmbedUrl,
      surveyService,
      authUser,
      project,
      phase,
      className,
    } = this.props;

    if (!isNilOrError(project)) {
      const { enabled, disabledReason } = getSurveyTakingRules({
        project,
        phaseContext: phase,
        signedIn: !isNilOrError(authUser),
      });
      const registrationNotCompleted =
        !isNilOrError(authUser) &&
        !authUser.attributes.registration_completed_at;
      const shouldVerify = !!(
        disabledReason === 'maybeNotVerified' ||
        disabledReason === 'notVerified'
      );

      if (
        disabledReason === 'maybeNotPermitted' ||
        disabledReason === 'maybeNotVerified' ||
        disabledReason === 'notVerified' ||
        registrationNotCompleted
      ) {
        return (
          <Container className={className || ''}>
            {/*
            <ProjectPageSectionTitle>
              <FormattedMessage {...messages.survey} />
            </ProjectPageSectionTitle>
            */}

            <SignUpInWrapper>
              <StyledSignUpIn
                metaData={{
                  flow: 'signup',
                  pathname: window.location.pathname,
                  inModal: true,
                  verification: shouldVerify,
                  noPushLinks: true,
                  noAutofocus: true,
                }}
                customSignInHeader={
                  <SignUpInHeader>
                    <FormattedMessage {...messages.logInToTakeTheSurvey} />
                  </SignUpInHeader>
                }
                customSignUpHeader={
                  <SignUpInHeader>
                    <FormattedMessage {...messages.signUpToTakeTheSurvey} />
                  </SignUpInHeader>
                }
                onSignUpInCompleted={this.noOp}
              />
            </SignUpInWrapper>
          </Container>
        );
      }

      if (enabled) {
        const email = authUser ? authUser.attributes.email : null;
        const user_id = authUser ? authUser.id : null;

        return (
          <Container
            id="project-survey"
            className={`${className} e2e-${surveyService}-survey enabled`}
          >
            <ProjectPageSectionTitle>
              <FormattedMessage {...messages.survey} />
            </ProjectPageSectionTitle>

            {surveyService === 'typeform' && (
              <TypeformSurvey
                typeformUrl={surveyEmbedUrl}
                email={email || null}
                user_id={user_id}
              />
            )}

            {surveyService === 'survey_monkey' && (
              <SurveymonkeySurvey surveymonkeyUrl={surveyEmbedUrl} />
            )}

            {surveyService === 'google_forms' && (
              <GoogleFormsSurvey googleFormsUrl={surveyEmbedUrl} />
            )}

            {surveyService === 'enalyzer' && (
              <EnalyzerSurvey enalyzerUrl={surveyEmbedUrl} />
            )}
          </Container>
        );
      }

      return (
        <Container className={`warning ${className || ''}`}>
          <Warning icon="lock">
            <FormattedMessage
              {...(disabledReason
                ? this.disabledMessage[disabledReason]
                : messages.surveyDisabledNotPossible)}
              values={{
                verificationLink: (
                  <button onClick={this.onVerify}>
                    <FormattedMessage {...messages.verificationLinkText} />
                  </button>
                ),
                signUpLink: (
                  <button onClick={this.signUp}>
                    <FormattedMessage {...messages.signUpLinkText} />
                  </button>
                ),
                logInLink: (
                  <button onClick={this.signIn}>
                    <FormattedMessage {...messages.logInLinkText} />
                  </button>
                ),
              }}
            />
          </Warning>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  project: ({ projectId, render }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <Survey {...inputProps} {...dataProps} />}
  </Data>
);
