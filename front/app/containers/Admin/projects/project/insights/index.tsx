import React from 'react';

import { Box, Title, Button } from 'component-library';
import { useParams } from 'react-router-dom';

import usePhase from 'api/phases/usePhase';

import { FormattedMessage } from 'utils/cl-intl';

import DemographicsWidget from './DemographicsWidget';
import messages from './messages';
import ParticipationMetrics from './ParticipationMetrics';

const AdminPhaseInsights = () => {
  const { phaseId } = useParams() as { phaseId: string };
  const { data: phase } = usePhase(phaseId);

  if (!phase) {
    return null;
  }

  return (
    <Box
      background="white"
      borderBottom="none"
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
    >
      <Box
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        <Title variant="h2" as="h1" color="textPrimary" m="0px">
          <FormattedMessage {...messages.insights} />
        </Title>
        <Box display="flex" gap="8px">
          <Button
            buttonStyle="secondary"
            icon="edit"
            onClick={() => {
              // TODO: Implement generate report
            }}
          >
            <FormattedMessage {...messages.generateReport} />
          </Button>
          <Button
            buttonStyle="primary"
            icon="download"
            onClick={() => {
              // TODO: Implement download
            }}
          >
            <FormattedMessage {...messages.download} />
          </Button>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap="16px" pt="16px">
        <Box display="flex" justifyContent="space-between">
          <ParticipationMetrics phase={phase.data} />
          <DemographicsWidget phase={phase.data} />
        </Box>
      </Box>
      <Button
        buttonStyle="text"
        icon="arrow-right"
        iconPos="right"
        onClick={() => {
          // TODO: Navigate to full report
        }}
      >
        <FormattedMessage {...messages.viewFullReport} />
      </Button>
    </Box>
  );
};

export default AdminPhaseInsights;
