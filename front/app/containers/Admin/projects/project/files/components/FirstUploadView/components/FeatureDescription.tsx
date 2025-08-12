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

  const disabled = !isDataRepositoryAIAnalysisEnabled;

  return (
    <Box
      bgColor={colors.white}
      display="flex"
      flexDirection="column"
      gap="20px"
    >
      <img src={DocumentAnalysis} alt="" />
      <UpsellTooltip disabled={!disabled}>
        <>
          <Title
            m="0px"
            color={disabled ? 'disabled' : 'grey700'}
            variant="h3"
            fontWeight="semi-bold"
          >
            {formatMessage(messages.aiPoweredInsights)}
            {disabled && (
              <Icon
                name="lock"
                mb="4px"
                ml="4px"
                width="20px"
                fill={colors.disabled}
              />
            )}
          </Title>
          <Text m="0px" color={disabled ? 'disabled' : 'grey700'}>
            {formatMessage(messages.aiPoweredInsightsDescription)}
          </Text>
        </>
      </UpsellTooltip>
    </Box>
  );
};

export default FeatureDescription;
