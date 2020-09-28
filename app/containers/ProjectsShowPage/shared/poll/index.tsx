import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { IParticipationContextType } from 'typings';

// services
import {
  getPollTakingRules,
  IPollTakingDisabledReason,
} from 'services/actionTakingRules';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetPollQuestions, {
  GetPollQuestionsChildProps,
} from 'resources/GetPollQuestions';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// components
import FormCompleted from './FormCompleted';
import PollForm from './PollForm';
import Warning from 'components/UI/Warning';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// events
import { openSignUpInModal } from 'components/SignUpIn/events';
import { openVerificationModal } from 'components/Verification/verificationModalEvents';

import styled from 'styled-components';

const Container = styled.div`
  color: ${({ theme }) => theme.colorText};
`;

const StyledWarning = styled(Warning)`
  margin-bottom: 30px;
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

interface Props extends InputProps, DataProps {}

const disabledMessages: {
  [key in IPollTakingDisabledReason]: ReactIntl.FormattedMessage.MessageDescriptor;
} = {
  projectInactive: messages.pollDisabledProjectInactive,
  maybeNotPermitted: messages.pollDisabledMaybeNotPermitted,
  maybeNotVerified: messages.pollDisabledMaybeNotVerified,
  notPermitted: messages.pollDisabledNotPermitted,
  notActivePhase: messages.pollDisabledNotActivePhase,
  notVerified: messages.pollDisabledNotVerified,
  alreadyResponded: messages.pollDisabledNotPossible, // will not be used
};

export class Poll extends PureComponent<Props> {
  onVerify = () => {
    const { type, projectId, phaseId } = this.props;
    const pcId = type === 'phase' ? phaseId : projectId;
    const pcType = type;

    if (pcId && pcType) {
      openVerificationModal({
        context: {
          action: 'taking_poll',
          id: pcId,
          type: pcType,
        },
      });
    }
  };

  signUpIn = (flow: 'signin' | 'signup') => {
    const { phaseId, project, phase } = this.props;

    if (!isNilOrError(project)) {
      const pcType = phaseId ? 'phase' : 'project';
      const pcId = phaseId ? phase?.id : project?.id;
      const takingPollDisabledReason =
        project.attributes?.action_descriptor?.taking_poll?.disabled_reason;

      openSignUpInModal({
        flow,
        verification: takingPollDisabledReason === 'not_verified',
        verificationContext: !!(
          takingPollDisabledReason === 'not_verified' &&
          pcId &&
          pcType
        )
          ? {
              action: 'taking_poll',
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

  render() {
    const {
      pollQuestions,
      projectId,
      phaseId,
      project,
      phase,
      type,
      authUser,
    } = this.props;

    if (
      !isNilOrError(pollQuestions) &&
      !isNilOrError(project) &&
      !!(type === 'phase' ? !isNilOrError(phase) : true)
    ) {
      const isSignedIn = !isNilOrError(authUser);
      const { enabled, disabledReason } = getPollTakingRules({
        project,
        phaseContext: phase,
        signedIn: !!authUser,
      });
      const message = disabledReason
        ? disabledMessages[disabledReason]
        : isSignedIn
        ? messages.pollDisabledNotPossible
        : messages.pollDisabledMaybeNotPermitted;

      return (
        <Container>
          {disabledReason === 'alreadyResponded' ? (
            <FormCompleted />
          ) : (
            <>
              {(!isSignedIn || !enabled) && (
                <StyledWarning icon="lock">
                  <FormattedMessage
                    {...message}
                    values={{
                      verificationLink: (
                        <button onClick={this.onVerify}>
                          <FormattedMessage
                            {...messages.verificationLinkText}
                          />
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
                </StyledWarning>
              )}
              <PollForm
                projectId={projectId}
                questions={pollQuestions}
                id={type === 'project' ? projectId : phaseId}
                type={type}
                disabled={!enabled || isNilOrError(authUser)}
              />
            </>
          )}
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  pollQuestions: ({ projectId, phaseId, type, render }) => (
    <GetPollQuestions
      participationContextId={
        type === 'project' ? projectId : (phaseId as string)
      }
      participationContextType={type}
    >
      {render}
    </GetPollQuestions>
  ),
  project: ({ projectId, render }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <Poll {...inputProps} {...dataProps} />}
  </Data>
);
