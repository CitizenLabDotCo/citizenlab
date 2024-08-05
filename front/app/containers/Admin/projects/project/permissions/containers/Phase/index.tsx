import React from 'react';

import { Title, Text, Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import { FormattedMessage } from 'utils/cl-intl';

import PhasePermissions from '../../components/PhasePermissions';
import messages from '../../messages';

const Phase = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };

  const { data: phase } = usePhase(phaseId || null);
  const { data: project } = useProjectById(projectId);

  if (!phase || !project) return null;

  return (
    <Box mb="48px">
      <Title variant="h2" color="primary">
        <FormattedMessage {...messages.participationRequirementsTitle} />
      </Title>
      <Text color="coolGrey600" pb="8px">
        <FormattedMessage {...messages.participationRequirementsSubtitle} />
      </Text>
      <PhasePermissions project={project.data} phase={phase.data} />
    </Box>
  );
};

export default Phase;
