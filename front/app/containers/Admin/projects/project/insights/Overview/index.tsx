import React from 'react';

import { Box, Title, Text } from 'component-library';
import { useParams } from 'react-router-dom';

import usePhase from 'api/phases/usePhase';

import { FormattedMessage } from 'utils/cl-intl';

import DemographicsWidget from '../DemographicsWidget';
import messages from '../messages';
import ParticipationMetrics from '../ParticipationMetrics';

const Overview = () => {
  const { phaseId } = useParams() as { phaseId: string };
  const { data: phase } = usePhase(phaseId);

  if (!phase) {
    return null;
  }

  return (
    <Box>
      <Title variant="h3" mb="8px">
        <FormattedMessage {...messages.overviewTitle} />
      </Title>
      <Text color="textSecondary" mb="32px">
        <FormattedMessage {...messages.overviewDescription} />
      </Text>

      <Box display="flex" flexDirection="column" gap="32px">
        <ParticipationMetrics phase={phase.data} />
        <DemographicsWidget phase={phase.data} />
      </Box>
    </Box>
  );
};

export default Overview;
