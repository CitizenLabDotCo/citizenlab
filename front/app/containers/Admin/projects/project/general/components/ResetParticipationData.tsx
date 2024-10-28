import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useResetProject from 'api/projects/useResetProject';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const ResetParticipationData = () => {
  const { projectId } = useParams() as { projectId: string };
  const { mutate: resetProject, isLoading: isProjectResetLoading } =
    useResetProject();

  const { formatMessage } = useIntl();
  return (
    <Button
      buttonStyle="delete"
      onClick={() => resetProject(projectId)}
      processing={isProjectResetLoading}
      ml="12px"
    >
      {formatMessage(messages.resetParticipationData)}
    </Button>
  );
};

export default ResetParticipationData;
