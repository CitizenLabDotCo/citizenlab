import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useResetProject from 'api/projects/useResetProject';

const ResetParticipationData = () => {
  const { projectId } = useParams() as { projectId: string };
  const { mutate: resetProject, isLoading: isProjectResetLoading } =
    useResetProject();
  return (
    <Button
      buttonStyle="delete"
      onClick={() => resetProject(projectId)}
      processing={isProjectResetLoading}
      ml="12px"
    >
      Reset participation data
    </Button>
  );
};

export default ResetParticipationData;
