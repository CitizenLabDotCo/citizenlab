import React, { memo } from 'react';
import useProjectById from 'api/projects/useProjectById';
import useCauses from 'api/causes/useCauses';

// components
import CauseCard from './CauseCard';

// styling
import styled from 'styled-components';

// typings
import { IParticipationContextType } from 'typings';
import { pastPresentOrFuture } from 'utils/dateUtils';
import usePhase from 'api/phases/usePhase';

const Container = styled.div`
  color: ${({ theme }) => theme.colors.tenantText};
`;

interface Props {
  type: IParticipationContextType;
  phaseId: string | null;
  projectId: string;
  className?: string;
}

const Volunteering = memo<Props>(
  ({ projectId, phaseId, type: participationContextType, className }) => {
    const participationContextId =
      participationContextType === 'project' ? projectId : phaseId;
    const { data: causes } = useCauses({
      participationContextType,
      participationContextId,
    });
    const { data: project } = useProjectById(projectId);
    const { data: phase } = usePhase(phaseId);

    if (
      causes &&
      (project || (participationContextType === 'phase' && phase))
    ) {
      const disabledPhase =
        phase &&
        pastPresentOrFuture([
          phase.data.attributes.start_at,
          phase.data.attributes.end_at,
        ]) !== 'present';

      const disabledProject =
        project?.data.attributes.publication_status !== 'published';

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
  }
);

export default Volunteering;
