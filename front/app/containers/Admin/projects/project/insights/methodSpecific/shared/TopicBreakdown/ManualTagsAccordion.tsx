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
  manualTopics: TopicData[];
  maxManualTopicCount: number;
}

const ManualTagsAccordion = ({ manualTopics, maxManualTopicCount }: Props) => {
  const { formatMessage } = useIntl();

  const summaryText = formatMessage(messages.manualTagsSummary, {
    taggedCount: manualTopics.reduce((sum, t) => sum + t.count, 0),
    topicsCount: manualTopics.length,
  });

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
              name="label"
              width="16px"
              height="16px"
              fill={colors.textPrimary}
            />
            <Text m="0" fontWeight="semi-bold" fontSize="s">
              {formatMessage(messages.manualTagsByParticipants)}
            </Text>
          </Box>
          <Text m="0" fontSize="s" color="textSecondary" mr="8px">
            {summaryText}
          </Text>
        </Box>
      }
    >
      <Box>
        {manualTopics.length > 0 ? (
          manualTopics.map((topic) => (
            <DistributionBar
              key={topic.id}
              name={topic.name}
              count={topic.count}
              percentage={topic.percentage}
              maxCount={maxManualTopicCount}
              barColor={colors.green700}
            />
          ))
        ) : (
          <Text m="0" color="textSecondary" fontSize="s">
            {formatMessage(messages.noManualTags)}
          </Text>
        )}
      </Box>
    </StyledAccordion>
  );
};

export default ManualTagsAccordion;
