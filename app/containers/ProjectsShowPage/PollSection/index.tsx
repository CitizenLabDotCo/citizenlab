import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import Link from 'utils/cl-router/Link';
import { IParticipationContextType } from 'typings';

import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetPollQuestions, { GetPollQuestionsChildProps } from 'resources/GetPollQuestions';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';
import { pollTakingState, DisabledReasons } from 'services/pollTakingRules';

import FormCompleted from './FormCompleted';
import PollForm from './PollForm';
import Warning from 'components/UI/Warning';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// events
import { openVerificationModalWithContext } from 'containers/App/events';

import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  color: ${({ theme }) => theme.colorText};
`;

const StyledWarning = styled(Warning)`
  margin-bottom: 30px;
`;

const VerifyButton = styled.button`
  color: ${colors.clBlueButtonText};
  text-decoration: underline;
  transition: all 100ms ease-out;

  &:hover {
    text-decoration: underline;
  }
  display: inline-block;
  padding: 0;
`;

const SignUpLink = styled(Link)`
  color: ${colors.clBlueButtonText};
  text-decoration: underline;
  transition: all 100ms ease-out;

  &:hover {
    text-decoration: underline;
  }
  display: inline-block;
  padding: 0;
`;

// Didn't manage to strongly type this component, here are the two typings it can actually have
// type ProjectProps = {
//   type: 'project',
//   phaseId: null,
//   projectId: string
// };
// type PhaseProps = {
//   type: 'phase',
//   phaseId: string,
//   projectId: string
// };

interface InputProps {
  type: IParticipationContextType;
  phaseId: string | null;
  projectId: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  pollQuestions: GetPollQuestionsChildProps;
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
}

interface Props extends InputProps, DataProps { }

const disabledMessages: { [key in Partial<DisabledReasons>]: ReactIntl.FormattedMessage.MessageDescriptor } = {
  projectInactive: messages.pollDisabledProjectInactive,
  maybeNotPermitted: messages.pollDisabledMaybeNotPermitted,
  notPermitted: messages.pollDisabledNotPermitted,
  notActivePhase: messages.pollDisabledNotActivePhase,
  notVerified: messages.pollDisabledNotVerified,
  alreadyResponded: messages.pollDisabledNotPossible // will not be used
};

export class PollSection extends PureComponent<Props> {
  onVerify = () => {
    const { type, projectId, phaseId } = this.props;
    if (type === 'project' && projectId) {
      openVerificationModalWithContext('ActionPost', projectId, 'project', 'taking_poll');
    } else if (type === 'phase' && phaseId) {
      openVerificationModalWithContext('ActionPost', phaseId, 'phase', 'taking_poll');
    }
  }

  render() {
    const { pollQuestions, projectId, phaseId, project, phase, type, authUser } = this.props;
    if (isNilOrError(pollQuestions) || isNilOrError(project) || type === 'phase' && isNilOrError(phase)) {
      return null;
    }
    const { enabled, disabledReason } = pollTakingState({ project, phaseContext: phase, signedIn: !!authUser });
    const message = disabledReason ? disabledMessages[disabledReason] : messages.pollDisabledNotPossible;

    return (
      <Container>
        {disabledReason === 'alreadyResponded'
          ? <FormCompleted />
          : <>
            {!enabled &&
              <StyledWarning icon="lock">
                <FormattedMessage
                  {...message}
                  values={{
                    verificationLink: <VerifyButton onClick={this.onVerify}><FormattedMessage {...messages.verificationLinkText} /></VerifyButton>,
                    signUpLink: <SignUpLink to="/sign-up"><FormattedMessage {...messages.signUpLinkText} /></SignUpLink>,
                    logInLink: <SignUpLink to="/sign-in"><FormattedMessage {...messages.logInLinkText} /></SignUpLink>
                  }}
                />
              </StyledWarning>
            }
            {enabled && isNilOrError(authUser) &&
              <StyledWarning icon="lock">
                <FormattedMessage
                  {...messages.signUpToTakePoll}
                  values={{
                    signUpLink: <SignUpLink to="/sign-up"><FormattedMessage {...messages.signUpLinkText} /></SignUpLink>,
                    logInLink: <SignUpLink to="/sign-in"><FormattedMessage {...messages.logInLinkText} /></SignUpLink>
                  }}
                />
              </StyledWarning>
            }
            <PollForm
              projectId={projectId}
              questions={pollQuestions}
              id={type === 'project' ? projectId : phaseId as string}
              type={type}
              disabled={!enabled || isNilOrError(authUser)}
            />
          </>
        }
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  pollQuestions: ({ projectId, phaseId, type, render }) => <GetPollQuestions participationContextId={type === 'project' ? projectId : phaseId as string} participationContextType={type}>{render}</GetPollQuestions>,
  project: ({ projectId, render }) => <GetProject id={projectId}>{render}</GetProject>,
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <PollSection {...inputProps} {...dataProps} />}
  </Data>
);
