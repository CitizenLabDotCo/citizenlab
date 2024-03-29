import React, { memo } from 'react';

import styled from 'styled-components';

import useCauses from 'api/causes/useCauses';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import { pastPresentOrFuture } from 'utils/dateUtils';

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
  const { data: phase } = usePhase(phaseId);

  if (causes && phase) {
    const disabledPhase =
      phase &&
      pastPresentOrFuture([
        phase.data.attributes.start_at,
        phase.data.attributes.end_at,
      ]) !== 'present';
    const disabledProject =
      project && project.data.attributes.publication_status !== 'published';

    return (
      <Container className={className} id="volunteering">
        {causes.data.map((cause) => (
          <CauseCard
            key={cause.id}
            cause={cause}
            disabled={disabledPhase || disabledProject}
          />
        ))}
      </Container>
    );
  }

  return null;
});

export default Volunteering;
