import React from 'react';

// components
import Volunteering from '../shared/volunteering';

// styling
import styled from 'styled-components';
import usePhase from 'api/phases/usePhase';

const Container = styled.div``;

interface Props {
  projectId: string;
  phaseId: string | null;
  className?: string;
}

const VolunteeringContainer = ({ projectId, className, phaseId }: Props) => {
  const { data: phase } = usePhase(phaseId);

  if (phase?.data.attributes.participation_method === 'volunteering') {
    return (
      <Container
        className={`e2e-timeline-project-volunteering-container ${
          className || ''
        }`}
      >
        <Volunteering phaseId={phaseId} projectId={projectId} />
      </Container>
    );
  }

  return null;
};

export default VolunteeringContainer;
