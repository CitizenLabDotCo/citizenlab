import React from 'react';

import { MessageDescriptor } from 'react-intl';
import styled from 'styled-components';

import usePhase from 'api/phases/usePhase';
import usePollQuestions from 'api/poll_questions/usePollQuestions';
import useProjectById from 'api/projects/useProjectById';

import { isFixableByAuthentication } from 'utils/actionDescriptors';
import globalMessages from 'utils/actionDescriptors/messages';
import { ProjectPollDisabledReason } from 'utils/actionDescriptors/types';
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

const disabledMessages: {
  [key in ProjectPollDisabledReason]: MessageDescriptor | undefined;
} = {
  project_inactive: messages.pollDisabledProjectInactive,
  project_not_visible: messages.pollDisabledNotPermitted,
  not_poll: messages.pollDisabledNotActivePhase,
  already_responded: messages.pollDisabledAlreadyResponded,
  user_not_active: undefined,
  user_not_verified: undefined,
  user_missing_requirements: undefined,
  user_not_signed_in: undefined,
  user_not_in_group: globalMessages.defaultNotInGroup,
  user_not_permitted: messages.pollDisabledNotPermitted,
  user_blocked: messages.pollDisabledNotPermitted,
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
    project.data.attributes.action_descriptors.taking_poll;

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
