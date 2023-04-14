import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { IParticipationContextType } from 'typings';

// services
import {
  getPollTakingRules,
  IPollTakingDisabledReason,
} from 'services/actionTakingRules';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useProject from 'hooks/useProject';
import usePhase from 'hooks/usePhase';

// resources
import GetPollQuestions, {
  GetPollQuestionsChildProps,
} from 'resources/GetPollQuestions';

// components
import FormCompleted from './FormCompleted';
import PollForm from './PollForm';
import Warning from 'components/UI/Warning';

// styling
import styled from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { MessageDescriptor } from 'react-intl';

// events
import { triggerAuthenticationFlow } from 'containers/NewAuthModal/events';

const Container = styled.div`
  color: ${({ theme }) => theme.colors.tenantText};
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
  pollQuestions: GetPollQuestionsChildProps;
}

interface Props extends InputProps, DataProps {}

const disabledMessages: {
  [key in IPollTakingDisabledReason]: MessageDescriptor;
} = {
  projectInactive: messages.pollDisabledProjectInactive,
  maybeNotPermitted: messages.pollDisabledMaybeNotPermitted,
  notActive: messages.pollDisabledNotActiveUser,
  maybeNotVerified: messages.pollDisabledMaybeNotVerified,
  notPermitted: messages.pollDisabledNotPermitted,
  notActivePhase: messages.pollDisabledNotActivePhase,
  notVerified: messages.pollDisabledNotVerified,
  alreadyResponded: messages.pollDisabledNotPossible, // will not be used
};

const Poll = ({ pollQuestions, projectId, phaseId, type }: Props) => {
  const authUser = useAuthUser();
  const project = useProject({ projectId });
  const phase = usePhase(phaseId);

  const signUpIn = (flow: 'signin' | 'signup') => {
    const pcType = phaseId ? 'phase' : 'project';
    const pcId = phaseId ? phaseId : projectId;

    if (!pcId || !pcType) return;

    triggerAuthenticationFlow({
      flow,
      context: {
        action: 'taking_poll',
        id: pcId,
        type: pcType,
      },
    });
  };

  const signIn = () => {
    signUpIn('signin');
  };

  const signUp = () => {
    signUpIn('signup');
  };

  if (
    isNilOrError(pollQuestions) ||
    isNilOrError(project) ||
    !(type === 'phase' ? !isNilOrError(phase) : true)
  ) {
    return null;
  }

  const isSignedIn = !isNilOrError(authUser);
  const { enabled, disabledReason } = getPollTakingRules({
    project,
    phaseContext: isNilOrError(phase) ? null : phase,
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
                    <button onClick={signUp}>
                      <FormattedMessage {...messages.verificationLinkText} />
                    </button>
                  ),
                  completeRegistrationLink: (
                    <button
                      id="e2e-complete-registration-link"
                      onClick={() => {
                        triggerAuthenticationFlow();
                      }}
                    >
                      <FormattedMessage
                        {...messages.completeRegistrationLinkText}
                      />
                    </button>
                  ),
                  signUpLink: (
                    <button onClick={signUp}>
                      <FormattedMessage {...messages.signUpLinkText} />
                    </button>
                  ),
                  logInLink: (
                    <button onClick={signIn}>
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
};

const Data = adopt<DataProps, InputProps>({
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
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <Poll {...inputProps} {...dataProps} />}
  </Data>
);
