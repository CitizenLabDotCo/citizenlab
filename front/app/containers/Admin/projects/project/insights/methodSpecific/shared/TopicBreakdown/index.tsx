import React from 'react';

import {
  Box,
  Text,
  Spinner,
  Icon,
  colors,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import AiTopicsAccordion from './AiTopicsAccordion';
import AiUpsellBanner from './AiUpsellBanner';
import ManualTagsAccordion from './ManualTagsAccordion';
import useTopicBreakdownData from './useTopicBreakdownData';

interface Props {
  phaseId: string;
}

const TopicBreakdown = ({ phaseId }: Props) => {
  const { formatMessage } = useIntl();

  const {
    isAiTopicsAllowed,
    aiTopics,
    manualTopics,
    totalInputs,
    maxAiTopicCount,
    maxManualTopicCount,
    isLoading,
  } = useTopicBreakdownData({ phaseId });

  if (isLoading) {
    return (
      <Box
        bgColor="white"
        borderRadius="8px"
        p="24px"
        boxShadow="0px 1px 2px 0px rgba(0,0,0,0.05)"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner size="24px" />
      </Box>
    );
  }

  return (
    <Box
      bgColor="white"
      borderRadius="8px"
      p="24px"
      boxShadow="0px 1px 2px 0px rgba(0,0,0,0.05)"
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="16px"
      >
        <Text m="0" fontWeight="semi-bold" fontSize="m">
          {formatMessage(messages.topicBreakdown)}
        </Text>
        <Box
          display="inline-flex"
          alignItems="center"
          gap="4px"
          px="8px"
          py="4px"
          borderRadius="4px"
          background="rgba(4, 77, 108, 0.1)"
        >
          <Icon name="stars" width="12px" height="12px" fill={colors.primary} />
          <Text m="0" fontSize="xs" fontWeight="bold" color="primary">
            {formatMessage(messages.aiPowered)}
          </Text>
        </Box>
      </Box>

      {isAiTopicsAllowed ? (
        <AiTopicsAccordion
          aiTopics={aiTopics}
          totalInputs={totalInputs}
          maxAiTopicCount={maxAiTopicCount}
        />
      ) : (
        <AiUpsellBanner />
      )}

      <Box borderTop={`1px solid ${colors.divider}`} mt="8px" pt="8px">
        <ManualTagsAccordion
          manualTopics={manualTopics}
          maxManualTopicCount={maxManualTopicCount}
        />
      </Box>
    </Box>
  );
};

export default TopicBreakdown;
