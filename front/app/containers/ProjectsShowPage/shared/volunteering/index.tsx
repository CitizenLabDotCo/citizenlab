import React, { memo } from 'react';

import styled from 'styled-components';

import useCauses from 'api/causes/useCauses';
import useProjectById from 'api/projects/useProjectById';

import CauseCard from './CauseCard';

const Container = styled.div`
  color: ${({ theme }) => theme.colors.tenantText};
`;

interface Props {
  phaseId: string | null;
  projectId: string;
  className?: string;
}

const Volunteering = memo<Props>(({ projectId, phaseId, className }) => {
  const { data: causes } = useCauses({
    phaseId,
  });
  const { data: project } = useProjectById(projectId);

  if (causes && project) {
    return (
      <Container className={className} id="volunteering">
        {causes.data.map((cause) => (
          <CauseCard key={cause.id} cause={cause} project={project} />
        ))}
      </Container>
    );
  }

  return null;
});

export default Volunteering;
