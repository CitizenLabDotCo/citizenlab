import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useVotingPhaseVotes from 'api/phase_insights/voting_insights/useVotingPhaseVotes';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import wordMessages from '../../word/messages';
import { useWordSection } from '../../word/useWordSection';
import { MethodSpecificInsightProps } from '../types';

import messages from './messages';
import VoteResults from './VoteResults';

const VotingInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data, isLoading, error } = useVotingPhaseVotes({
    phaseId,
  });

  useWordSection(
    'vote-results',
    () => {
      if (!data) return [];
      const { ideas } = data.data.attributes;
      if (ideas.length === 0) return [];

      const rows: string[][] = [
        [
          formatMessage(messages.idea),
          formatMessage(wordMessages.percentage),
          formatMessage(wordMessages.votes),
        ],
      ];

      ideas.forEach((idea) => {
        const votesText =
          idea.offline_votes > 0
            ? formatMessage(messages.xVotesInclOffline, {
                count: idea.total_votes,
                offlineCount: idea.offline_votes,
              })
            : formatMessage(messages.xVotes, { count: idea.total_votes });

        rows.push([
          localize(idea.title_multiloc),
          idea.percentage !== null ? `${idea.percentage.toFixed(1)}%` : '-',
          votesText,
        ]);
      });

      return [
        {
          type: 'heading' as const,
          text: formatMessage(wordMessages.voteResults),
          level: 2 as const,
        },
        { type: 'table' as const, rows, columnWidths: [50, 25, 25] },
      ];
    },
    { skip: isLoading || !!error || !data }
  );

  return (
    <Box my="12px" bg="white">
      <VoteResults phaseId={phaseId} />
    </Box>
  );
};

export default VotingInsights;
