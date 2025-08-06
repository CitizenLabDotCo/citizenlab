import React from 'react';

import {
  Box,
  Title,
  Text,
  colors,
  Icon,
} from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import UpsellTooltip from 'components/UpsellTooltip';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import DocumentAnalysis from '../resources/DocumentAnalysis.svg';

const FeatureDescription = () => {
  const { formatMessage } = useIntl();
  const isDataRepositoryAIAnalysisEnabled = useFeatureFlag({
    name: 'data_repository_ai_analysis',
  });

  return (
    <Box
      bgColor={colors.white}
      display="flex"
      flexDirection="column"
      gap="20px"
    >
      <img src={DocumentAnalysis} alt="" />
      <Title m="0px" variant="h3" fontWeight="semi-bold">
        {formatMessage(messages.aiPoweredInsights)}
        {!isDataRepositoryAIAnalysisEnabled && (
          <UpsellTooltip disabled={isDataRepositoryAIAnalysisEnabled}>
            <Icon
              name="lock"
              mb="4px"
              ml="4px"
              width="20px"
              fill={colors.coolGrey600}
            />
          </UpsellTooltip>
        )}
      </Title>
      <Text m="0px" color="grey700">
        {formatMessage(messages.aiPoweredInsightsDescription)}
      </Text>
    </Box>
  );
};

export default FeatureDescription;
