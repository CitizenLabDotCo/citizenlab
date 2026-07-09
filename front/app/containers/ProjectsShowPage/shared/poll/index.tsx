import React from 'react';

import styled from 'styled-components';

import usePhase from 'api/phases/usePhase';
import { getPhaseActionDescriptor } from 'api/phases/utils';
import usePollQuestions from 'api/poll_questions/usePollQuestions';

import {
  getPermissionsDisabledMessage,
  isFixableByAuthentication,
} from 'utils/actionDescriptors';
import { isNilOrError } from 'utils/helperUtils';

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

const Poll = ({ projectId, phaseId }: Props) => {
  const { data: phase } = usePhase(phaseId);
  const { data: pollQuestions } = usePollQuestions({
    phaseId,
  });

  if (isNilOrError(pollQuestions) || !phase) {
    return null;
  }

  const { enabled, disabled_reason } = getPhaseActionDescriptor(
    phase.data,
    'taking_poll'
  );

  const disabledMessage =
    getPermissionsDisabledMessage('taking_poll', disabled_reason) || null;

  const message = !enabled
    ? disabledMessage ?? messages.pollDisabledNotPossible
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
            disabledReason={disabled_reason}
            disabledMessage={message}
            actionDisabledAndNotFixable={actionDisabledAndNotFixable}
          />
        </>
      )}
    </Container>
  );
};

export default Poll;
