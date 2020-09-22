import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Poll from '../shared/poll';

// hooks
import usePhase from 'hooks/usePhase';

// styling
import styled from 'styled-components';

const Container = styled.div`
  padding-bottom: 100px;
`;

interface Props {
  projectId: string;
  phaseId: string | null;
  className?: string;
}

const PollContainer = memo<Props>(({ projectId, phaseId, className }) => {
  const phase = usePhase(phaseId);

  if (
    !isNilOrError(phase) &&
    phase.attributes.participation_method === 'poll'
  ) {
    return (
      <Container
        className={`e2e-timeline-project-poll-container ${className || ''}`}
      >
        <Poll phaseId={phaseId} projectId={projectId} type="phase" />
      </Container>
    );
  }

  return null;
});

export default PollContainer;
