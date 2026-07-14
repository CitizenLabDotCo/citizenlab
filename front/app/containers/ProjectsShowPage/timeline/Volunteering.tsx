import React from 'react';

import styled from 'styled-components';

import usePhase from 'api/phases/usePhase';

import Volunteering from '../shared/volunteering';

const Container = styled.div``;

interface Props {
  phaseId: string | null;
  className?: string;
}

const VolunteeringContainer = ({ className, phaseId }: Props) => {
  const { data: phase } = usePhase(phaseId);

  if (phase?.data.attributes.participation_method === 'volunteering') {
    return (
      <Container
        className={`e2e-timeline-project-volunteering-container ${
          className || ''
        }`}
      >
        <Volunteering phase={phase.data} />
      </Container>
    );
  }

  return null;
};

export default VolunteeringContainer;
