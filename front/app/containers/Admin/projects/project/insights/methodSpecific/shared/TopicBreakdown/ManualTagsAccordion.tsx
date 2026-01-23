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

import BreakdownBar from '../BreakdownBar';
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
  totalInputs: number;
  taggedInputs: number;
  maxManualTopicCount: number;
  /** 'upsell' shows inputs/tagged count, 'full' shows ideas/topics count with info box */
  variant: 'upsell' | 'full';
}

const ManualTagsAccordion = ({
  manualTopics,
  totalInputs,
  taggedInputs,
  maxManualTopicCount,
  variant,
}: Props) => {
  const { formatMessage } = useIntl();

  const summaryText =
    variant === 'upsell'
      ? `${totalInputs} ${formatMessage(
          messages.inputs
        )} · ${taggedInputs} ${formatMessage(messages.tagged)}`
      : `${taggedInputs} ${formatMessage(messages.ideas)} · ${
          manualTopics.length
        } ${formatMessage(messages.topics)}`;

  const iconFill =
    variant === 'upsell' ? colors.textSecondary : colors.textPrimary;

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
            <Icon name="label" width="16px" height="16px" fill={iconFill} />
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
        {variant === 'full' && (
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
              {formatMessage(messages.manualTagsCoverage, {
                tagged: taggedInputs,
                total: totalInputs,
                percentage:
                  totalInputs > 0
                    ? Math.round((taggedInputs / totalInputs) * 100)
                    : 0,
              })}
            </Text>
          </Box>
        )}

        {manualTopics.length > 0 ? (
          manualTopics.map((topic) => (
            <BreakdownBar
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
