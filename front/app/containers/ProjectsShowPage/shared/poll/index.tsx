import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { IParticipationContextType } from 'typings';

// hooks
import useProjectById from 'api/projects/useProjectById';
import usePhase from 'api/phases/usePhase';

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
import globalMessages from 'utils/messages';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { PollDisabledReason } from 'api/projects/types';

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

const disabledMessages: { [key in PollDisabledReason] } = {
  project_inactive: messages.pollDisabledProjectInactive,
  not_active: messages.pollDisabledNotActiveUser,
  not_verified: messages.pollDisabledNotVerified,
  missing_data: messages.pollDisabledNotActiveUser,
  not_signed_in: messages.pollDisabledMaybeNotPermitted,
  not_in_group: globalMessages.notInGroup,
  not_poll: messages.pollDisabledNotActivePhase,
  already_responded: messages.pollDisabledAlreadyResponded,
  not_permitted: messages.pollDisabledNotPermitted,
};

export const Poll = ({ pollQuestions, projectId, phaseId, type }: Props) => {
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);

  if (
    isNilOrError(pollQuestions) ||
    !project ||
    !(type === 'phase' ? phase : true)
  ) {
    return null;
  }

  const { enabled, disabled_reason } =
    project.data.attributes.action_descriptor.taking_poll;

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

  const message = !enabled
    ? disabledMessages[disabled_reason] ?? messages.pollDisabledNotPossible
    : null;

  return (
    <Container data-testid="poll-container">
      {disabled_reason === 'already_responded' ? (
        <FormCompleted />
      ) : (
        <>
          {message && (
            <StyledWarning icon="lock" data-testid="poll-styled-warning">
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
            phaseId={phaseId}
            questions={pollQuestions}
            id={type === 'project' ? projectId : phaseId}
            type={type}
            contextId={''}
            disabled={false}
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
