import React from 'react';

import {
  Box,
  IconTooltip,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import { OpinionGroupsAttributes } from 'api/opinion_groups/types';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface TileProps {
  label: string;
  value: string;
  detail: string;
  tooltip?: string;
}

const StatTile = ({ label, value, detail, tooltip }: TileProps) => (
  <Box
    flex="1 1 160px"
    p="16px"
    bgColor="white"
    border={`1px solid ${colors.grey300}`}
    borderRadius="3px"
  >
    <Box display="flex" alignItems="center" gap="4px">
      <Text m="0" fontSize="s" color="textSecondary">
        {label}
      </Text>
      {tooltip && <IconTooltip content={tooltip} />}
    </Box>
    <Text
      as="span"
      color="primary"
      fontSize="xxxl"
      fontWeight="bold"
      lineHeight="1.1"
      m="0"
      mt="8px"
    >
      {value}
    </Text>
    <Text m="0" mt="4px" fontSize="xs" color="textSecondary">
      {detail}
    </Text>
  </Box>
);

interface Props {
  attributes: OpinionGroupsAttributes;
}

const StatsRow = ({ attributes }: Props) => {
  const { formatMessage, formatNumber } = useIntl();
  const { stats } = attributes;

  const candidateScores = stats.k_candidates
    .map((candidate) => `${candidate.k}: ${candidate.silhouette.toFixed(2)}`)
    .join(', ');

  return (
    <Box display="flex" flexWrap="wrap" gap="12px">
      <StatTile
        label={formatMessage(messages.participants)}
        value={formatNumber(stats.participants_included)}
        detail={formatMessage(messages.participantsDetail, {
          included: formatNumber(stats.participants_included),
          total: formatNumber(stats.participants_total),
        })}
      />
      <StatTile
        label={formatMessage(messages.statements)}
        value={formatNumber(stats.statements_included)}
        detail={formatMessage(messages.statementsDetail, {
          included: formatNumber(stats.statements_included),
          total: formatNumber(stats.statements_total),
        })}
      />
      <StatTile
        label={formatMessage(messages.reactions)}
        value={formatNumber(stats.votes_included)}
        detail={formatMessage(messages.reactionsDetail, {
          included: formatNumber(stats.votes_included),
          total: formatNumber(stats.votes_total),
        })}
      />
      <StatTile
        label={formatMessage(messages.groups)}
        value={formatNumber(stats.group_count)}
        detail={formatMessage(messages.groupsDetail, {
          silhouette: stats.silhouette.toFixed(2),
        })}
        tooltip={
          formatMessage(messages.groupsDetailTooltip) +
          (candidateScores
            ? ` ${formatMessage(messages.candidateGroups, {
                scores: candidateScores,
              })}`
            : '')
        }
      />
    </Box>
  );
};

export default StatsRow;
