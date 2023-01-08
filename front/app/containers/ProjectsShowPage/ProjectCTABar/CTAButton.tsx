import React from 'react';

// Components
import { Box } from '@citizenlab/cl2-component-library';

// hooks
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getParticipationMethod } from 'utils/participationMethodUtils';
import { getMethodConfig } from 'utils/participationMethodUtils';

type CTAButtonProps = {
  projectId: string;
};

export const CTAButton = ({ projectId }: CTAButtonProps) => {
  const project = useProject({ projectId });
  const phases = usePhases(projectId);
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
