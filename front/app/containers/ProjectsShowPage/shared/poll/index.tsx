import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { IParticipationContextType } from 'typings';

// hooks
import useProjectById from 'api/projects/useProjectById';
import usePhase from 'api/phases/usePhase';
import usePollQuestions from 'api/poll_questions/usePollQuestions';

// components
import FormCompleted from './FormCompleted';
import PollForm from './PollForm';

// styling
import styled from 'styled-components';

// i18n
import messages from './messages';
import globalMessages from 'utils/messages';

// events
import { PollDisabledReason } from 'api/projects/types';

// utils
import { isFixableByAuthentication } from 'utils/actionDescriptors';

const Container = styled.div`
  color: ${({ theme }) => theme.colors.tenantText};
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
  not_active: undefined,
  not_verified: undefined,
  missing_data: undefined,
  not_signed_in: undefined,
  not_in_group: globalMessages.notInGroup,
  not_poll: messages.pollDisabledNotActivePhase,
  already_responded: messages.pollDisabledAlreadyResponded,
  not_permitted: messages.pollDisabledNotPermitted,
};

const Poll = ({ projectId, phaseId, type }: Props) => {
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);
  const { data: pollQuestions } = usePollQuestions({
    participationContextId:
      type === 'project' ? projectId : (phaseId as string),
    participationContextType: type,
  });

  if (
    isNilOrError(pollQuestions) ||
    !project ||
    !(type === 'phase' ? phase : true)
  ) {
    return null;
  }

  const { enabled, disabled_reason } =
    project.data.attributes.action_descriptor.taking_poll;

  const message = !enabled
    ? disabledMessages[disabled_reason] ?? messages.pollDisabledNotPossible
    : null;

  const actionDisabledAndNotFixable =
    !enabled && !isFixableByAuthentication(disabled_reason);

  return (
    <Container data-testid="poll-container">
      {disabled_reason === 'already_responded' ? (
        <FormCompleted />
      ) : (
        <>
          <PollForm
            projectId={projectId}
            phaseId={phaseId}
            questions={pollQuestions.data}
            id={type === 'project' ? projectId : phaseId}
            type={type}
            disabled={!enabled}
            disabledMessage={message}
            actionDisabledAndNotFixable={actionDisabledAndNotFixable}
          />
        </>
      )}
    </Container>
  );
};

export default Poll;
