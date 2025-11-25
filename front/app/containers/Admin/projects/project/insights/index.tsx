import React from 'react';

import { Box, Title, Button } from 'component-library';
import { useParams } from 'react-router-dom';

import usePhase from 'api/phases/usePhase';

import { FormattedMessage } from 'utils/cl-intl';

import DemographicsSection from './DemographicsSection';
import messages from './messages';
import MethodSpecificInsights from './methodSpecific/MethodSpecificInsights';
import SurveyActions from './methodSpecific/nativeSurvey/SurveyActions';
import ParticipantsTimeline from './ParticipantsTimeline';
import ParticipationMetrics from './ParticipationMetrics';

const AdminPhaseInsights = () => {
  const { phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { data: phase } = usePhase(phaseId);

  if (!phase) {
    return null;
  }

  const participationMethod = phase.data.attributes.participation_method;
  const isNativeSurvey = participationMethod === 'native_survey';

  return (
    <Box
      background="white"
      borderBottom="none"
      display="flex"
      flexDirection="column"
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
          {isNativeSurvey ? (
            <SurveyActions phase={phase.data} />
          ) : (
            <>
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
            </>
          )}
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap="16px" pt="16px">
        <ParticipationMetrics phase={phase.data} />

        <ParticipantsTimeline phaseId={phase.data.id} />

        <DemographicsSection phase={phase.data} />

        <MethodSpecificInsights
          phaseId={phase.data.id}
          participationMethod={participationMethod}
        />
      </Box>
    </Box>
  );
};

export default AdminPhaseInsights;
