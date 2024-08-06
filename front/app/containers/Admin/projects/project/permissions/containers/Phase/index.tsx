import React from 'react';

import { Title, Text, Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import usePhase from 'api/phases/usePhase';

import { FormattedMessage } from 'utils/cl-intl';

import PhasePermissions from '../../components/PhasePermissions';
import messages from '../../messages';

const Phase = () => {
  const { phaseId } = useParams();
  const { data: phase } = usePhase(phaseId);

  if (!phase) return null;

  return (
    <Box mb="48px">
      <Title variant="h2" color="primary">
        <FormattedMessage {...messages.participationRequirementsTitle} />
      </Title>
      <Text color="coolGrey600" pb="8px">
        <FormattedMessage {...messages.participationRequirementsSubtitle} />
      </Text>
      <PhasePermissions phase={phase.data} />
    </Box>
  );
};

export default Phase;
