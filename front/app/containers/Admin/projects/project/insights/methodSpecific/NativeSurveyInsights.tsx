import React from 'react';

import { Box, Title } from 'component-library';

import usePhase from 'api/phases/usePhase';

import FormResults from 'components/admin/FormResults';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import { MethodSpecificInsightProps } from './types';

const NativeSurveyInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  const { data: phase } = usePhase(phaseId);

  if (!phase) {
    return null;
  }

  return (
    <Box
      background="white"
      borderRadius="3px"
      py="24px"
      display="flex"
      flexDirection="column"
      gap="16px"
    >
      <Title variant="h3" as="h2" color="textPrimary" m="0px">
        <FormattedMessage {...messages.questions} />
      </Title>

      <FormResults
        projectId={phase.data.relationships.project.data.id}
        phaseId={phase.data.id}
      />
    </Box>
  );
};

export default NativeSurveyInsights;
