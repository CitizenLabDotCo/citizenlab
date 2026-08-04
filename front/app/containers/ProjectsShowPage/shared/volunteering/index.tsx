import React, { memo } from 'react';

import styled from 'styled-components';

import useCauses from 'api/causes/useCauses';
import { IPhaseData } from 'api/phases/types';

import CauseCard from './CauseCard';

const Container = styled.div`
  color: ${({ theme }) => theme.colors.tenantText};
`;

interface Props {
  phase: IPhaseData;
  className?: string;
}

const Volunteering = memo<Props>(({ phase, className }) => {
  const { data: causes } = useCauses({
    phaseId: phase.id,
  });

  if (causes) {
    return (
      <Container className={className} id="volunteering">
        {causes.data.map((cause) => (
          <CauseCard key={cause.id} cause={cause} phase={phase} />
        ))}
      </Container>
    );
  }

  return null;
});

export default Volunteering;
