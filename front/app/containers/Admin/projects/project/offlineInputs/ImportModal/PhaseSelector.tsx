import React from 'react';

// router

import { Box, Text } from '@citizenlab/cl2-component-library';
import PhaseSelector from 'containers/Admin/projects/components/PhaseSelector';
import { useParams } from 'react-router-dom';

import { FormattedMessage } from 'utils/cl-intl';

import usePhases from 'api/phases/usePhases';
import { canContainIdeas } from 'api/phases/utils';

import messages from './messages';

const PhaseSelectorWrapper = () => {
  const { projectId } = useParams() as { projectId: string };
  const { data: phases } = usePhases(projectId);
  const phasesThatCanContainIdeas = phases?.data.filter(canContainIdeas);

  if (!phasesThatCanContainIdeas) return null;
  if (phasesThatCanContainIdeas.length === 0) {
    return (
      <Box display="flex" alignItems="center">
        <Text color="error">
          <FormattedMessage {...messages.noPhasesInProject} />
        </Text>
      </Box>
    );
  }

  return (
    <Box mb="20px">
      <Box w="100%" maxWidth="300px">
        <PhaseSelector label={<FormattedMessage {...messages.addToPhase} />} />
      </Box>
    </Box>
  );
};

export default PhaseSelectorWrapper;
