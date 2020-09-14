import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import TypeformSurvey from './TypeformSurvey';
import SurveymonkeySurvey from './SurveymonkeySurvey';
import GoogleFormsSurvey from './GoogleFormsSurvey';
import Warning from 'components/UI/Warning';

// services
import {
  getSurveyTakingRules,
  DisabledReasons,
} from 'services/surveyTakingRules';

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
import { fontSizes } from 'utils/styleUtils';

const Container = styled.div``;

const Title = styled.h2`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xxxl}px;
  line-height: normal;
  font-weight: 500;
  text-align: left;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
  margin-bottom: 25px;
  padding: 0;
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

  disabledMessage: {
    [key in DisabledReasons]: ReactIntl.FormattedMessage.MessageDescriptor;
  } = {
    projectInactive: messages.surveyDisabledProjectInactive,
    maybeNotPermitted: messages.surveyDisabledMaybeNotPermitted,
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

      if (enabled) {
        const email = authUser ? authUser.attributes.email : null;
        const user_id = authUser ? authUser.id : null;

        return (
          <Container className={`${className} e2e-${surveyService}-survey`}>
            <Title>
              <FormattedMessage {...messages.survey} />
            </Title>

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
          </Container>
        );
      } else {
        const message = disabledReason
          ? this.disabledMessage[disabledReason]
          : messages.surveyDisabledNotPossible;

        return (
          <Container className={`warning ${className || ''}`}>
            <Warning icon="lock">
              <FormattedMessage
                {...message}
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
