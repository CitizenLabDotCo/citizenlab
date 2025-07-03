import React from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';

import useCustomFields from 'api/custom_fields/useCustomFields';

import { useIntl } from 'utils/cl-intl';
import { calculateEstimatedSurveyTime } from 'utils/surveyUtils';

import messages from '../messages';

const TimeToComplete = ({
  projectId,
  phaseId,
}: {
  projectId: string;
  phaseId: string;
}) => {
  const { formatMessage } = useIntl();
  const { data: customFields } = useCustomFields({
    projectId,
    phaseId,
    publicFields: true,
  });

  if (!customFields) {
    return null;
  }

  // Calculate estimated time to complete survey
  const estimatedMinutesToComplete = calculateEstimatedSurveyTime(customFields);

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Icon
        my="auto"
        height="14px"
        fill={colors.teal}
        m="0px"
        name="clock-circle"
      />
      <Text fontSize="s" color="teal" textAlign="center" lineHeight="1" m="0px">
        {formatMessage(messages.xMinutesToComplete, {
          minutes: estimatedMinutesToComplete,
        })}
      </Text>
    </Box>
  );
};

export default TimeToComplete;
