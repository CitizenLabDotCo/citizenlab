import React from 'react';

import { colors, Icon, Text } from '@citizenlab/cl2-component-library';

import { IFlatCustomField } from 'api/custom_fields/types';
import useCustomFields from 'api/custom_fields/useCustomFields';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

// calculateEstimatedSurveyTime:
// This function calculates the estimated time to complete a survey based on the number of questions and pages.
export const calculateEstimatedSurveyTime = (
  customFields: IFlatCustomField[]
) => {
  // Count # pages
  const pagesCount =
    customFields.filter((field) => field.input_type === 'page').length || 0;

  // Count # questions
  const questionCount = (customFields.length || 0) - pagesCount;

  // Calculate estimated time in seconds, 6 seconds per question and 2 seconds per page
  const estimatedTimeToComplete = 6 * questionCount + 2 * pagesCount;

  // Convert seconds to minutes and return
  return Math.ceil(estimatedTimeToComplete / 60);
};

const SurveyTimeToComplete = ({
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
    <>
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
    </>
  );
};

export default SurveyTimeToComplete;
