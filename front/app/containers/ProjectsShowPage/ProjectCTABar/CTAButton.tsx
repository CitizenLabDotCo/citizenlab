import React from 'react';

// Components
import { Box } from '@citizenlab/cl2-component-library';

// hooks
import useProject from 'hooks/useProject';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getParticipationMethod } from 'utils/participationMethodUtils';
import { getMethodConfig } from 'utils/participationMethodUtils';

// services
import { IPhaseData } from 'services/phases';

type CTAButtonProps = {
  projectId: string;
  phases: Error | IPhaseData[] | null | undefined;
};

export const CTAButton = ({ projectId, phases }: CTAButtonProps) => {
  const project = useProject({ projectId });
  const participationMethod = project
    ? getParticipationMethod(project, phases)
    : undefined;

  if (isNilOrError(project) || !participationMethod) {
    return null;
  }

  return (
    <Box>
      {getMethodConfig(participationMethod).renderCTAButton({
        project,
        phases,
      })}
    </Box>
  );
};
