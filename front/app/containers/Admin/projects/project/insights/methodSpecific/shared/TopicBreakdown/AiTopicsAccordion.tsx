import React from 'react';

import {
  Box,
  Text,
  Icon,
  colors,
  Accordion,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import DistributionBar from '../DistributionBar';
import messages from '../messages';

import { TopicData } from './useTopicBreakdownData';

const StyledAccordion = styled(Accordion)`
  border: none;
  padding: 0;
  margin: 0;

  &:hover {
    background-color: transparent;
  }
`;

interface Props {
  aiTopics: TopicData[];
  totalInputs: number;
  maxAiTopicCount: number;
}

const AiTopicsAccordion = ({
  aiTopics,
  totalInputs,
  maxAiTopicCount,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <StyledAccordion
      isOpenByDefault={false}
      title={
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          w="100%"
        >
          <Box display="flex" alignItems="center" gap="8px">
            <Icon
              name="stars"
              width="16px"
              height="16px"
              fill={colors.textPrimary}
            />
            <Text m="0" fontWeight="semi-bold" fontSize="s">
              {formatMessage(messages.aiTopicDistribution)}
            </Text>
          </Box>
          <Text m="0" fontSize="s" color="textSecondary" mr="8px">
            {formatMessage(messages.aiTopicsSummary, {
              inputsCount: totalInputs,
              topicsCount: aiTopics.length,
            })}
          </Text>
        </Box>
      }
    >
      <Box>
        <Box
          bgColor={colors.grey100}
          borderRadius="4px"
          p="8px"
          mb="12px"
          display="flex"
          alignItems="center"
          gap="6px"
        >
          <Icon
            name="info-outline"
            width="14px"
            height="14px"
            fill={colors.textSecondary}
          />
          <Text m="0" fontSize="xs" color="textSecondary">
            {formatMessage(messages.topicsAutoDetected)}
          </Text>
        </Box>

        {aiTopics.length > 0 ? (
          aiTopics.map((topic) => (
            <DistributionBar
              key={topic.id}
              name={topic.name}
              count={topic.count}
              percentage={topic.percentage}
              maxCount={maxAiTopicCount}
              barColor={colors.blue700}
              badgeColor={colors.blue700}
            />
          ))
        ) : (
          <Text m="0" color="textSecondary" fontSize="s">
            {formatMessage(messages.noAiTopics)}
          </Text>
        )}
      </Box>
    </StyledAccordion>
  );
};

export default AiTopicsAccordion;
