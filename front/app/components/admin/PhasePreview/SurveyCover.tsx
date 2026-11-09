import React from 'react';

import {
  Box,
  colors,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';

import useCustomFields from 'api/custom_fields/useCustomFields';

import { calculateEstimatedSurveyTime } from 'components/SurveyTimeToComplete';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import PreviewSkeleton from './PreviewSkeleton';

interface Props {
  projectId: string;
  phaseId: string;
}

const SurveyCover = ({ projectId, phaseId }: Props) => {
  const { data: fields } = useCustomFields({
    projectId,
    phaseId,
    publicFields: true,
  });
  const questions = fields?.filter(
    (field) => field.enabled && field.input_type !== 'page'
  );

  if (!questions?.length || !fields) {
    return <PreviewSkeleton kind="form" />;
  }

  const minutes = calculateEstimatedSurveyTime(
    fields.filter((field) => field.enabled)
  );

  return (
    <Box display="flex" gap="8px" flexWrap="wrap">
      <Box
        background={colors.grey200}
        borderRadius={stylingConsts.borderRadius}
        px="8px"
        py="4px"
      >
        <Text fontSize="s" m="0">
          <FormattedMessage
            {...messages.surveyQuestionCount}
            values={{ count: questions.length }}
          />
        </Text>
      </Box>
      <Box
        background={colors.grey200}
        borderRadius={stylingConsts.borderRadius}
        px="8px"
        py="4px"
      >
        <Text fontSize="s" m="0">
          <FormattedMessage {...messages.surveyDuration} values={{ minutes }} />
        </Text>
      </Box>
    </Box>
  );
};

export default SurveyCover;
