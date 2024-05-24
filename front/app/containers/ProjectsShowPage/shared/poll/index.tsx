import React from 'react';

import styled from 'styled-components';

import usePhase from 'api/phases/usePhase';
import usePollQuestions from 'api/poll_questions/usePollQuestions';
import { PollDisabledReason } from 'api/projects/types';
import useProjectById from 'api/projects/useProjectById';

import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { isNilOrError } from 'utils/helperUtils';
import globalMessages from 'utils/messages';

import FormCompleted from './FormCompleted';
import messages from './messages';
import PollForm from './PollForm';

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

interface Props {
  phaseId: string;
  projectId: string;
}

const disabledMessages: { [key in PollDisabledReason] } = {
  project_inactive: messages.pollDisabledProjectInactive,
  not_active: undefined,
  not_verified: undefined,
  missing_user_requirements: undefined,
  not_signed_in: undefined,
  not_in_group: globalMessages.notInGroup,
  not_poll: messages.pollDisabledNotActivePhase,
  already_responded: messages.pollDisabledAlreadyResponded,
  not_permitted: messages.pollDisabledNotPermitted,
};

const Poll = ({ projectId, phaseId }: Props) => {
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);
  const { data: pollQuestions } = usePollQuestions({
    phaseId,
  });

  if (isNilOrError(pollQuestions) || !project || !phase) {
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
            questions={pollQuestions.data}
            phaseId={phaseId}
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
