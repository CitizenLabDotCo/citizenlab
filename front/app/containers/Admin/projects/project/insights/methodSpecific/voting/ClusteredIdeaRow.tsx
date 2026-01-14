import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { DemographicOption } from 'api/phase_insights/types';
import { VotingIdeaResult } from 'api/phase_insights/voting_insights/types';

import useLocalize from 'hooks/useLocalize';

import ProgressBarWrapper from 'containers/ProjectsShowPage/timeline/VotingResults/ProgressBar/ProgressBarWrapper';

import { useIntl } from 'utils/cl-intl';

import { INSIGHTS_CHART_COLORS } from '../../constants';

import IdeaThumbnail from './IdeaThumbnail';
import messages from './messages';
import { getScaledPercentages, getDemographicLabel } from './utils';
import VoteStats from './VoteStats';

interface Props {
  idea: VotingIdeaResult;
  demographicKeys: string[];
  options: Record<string, DemographicOption> | undefined;
}

const ClusteredIdeaRow = ({ idea, demographicKeys, options }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const title = localize(idea.title_multiloc);

  const { onlinePct, offlinePct } = getScaledPercentages(
    idea.online_votes,
    idea.offline_votes,
    idea.percentage
  );

  return (
    <Box py="16px">
      <Box display="flex" alignItems="center" gap="16px">
        <Box flexShrink={0}>
          <IdeaThumbnail imageUrl={idea.image_url} alt={title} />
        </Box>

        <Box flex="1" minWidth="0">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb="8px"
          >
            <Text
              m="0"
              fontSize="s"
              fontWeight="bold"
              color="textPrimary"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {title}
            </Text>
            <VoteStats idea={idea} />
          </Box>
          <ProgressBarWrapper
            votesPercentage={onlinePct}
            manualVotesPercentage={offlinePct}
            tooltip={formatMessage(messages.votesTooltip)}
            barColor={INSIGHTS_CHART_COLORS.darkBlue}
            bgColor={colors.grey300}
            height="16px"
          />
        </Box>
      </Box>

      <Box ml="76px" mt="12px">
        {demographicKeys.map((key) => {
          const breakdown = idea.series?.[key];
          const percentage = breakdown?.percentage ?? 0;
          const label = getDemographicLabel(
            key,
            options,
            localize,
            formatMessage
          );

          return (
            <Box
              key={key}
              display="flex"
              alignItems="center"
              gap="12px"
              py="6px"
            >
              <Text
                m="0"
                fontSize="s"
                color="textSecondary"
                style={{ width: '100px', flexShrink: 0 }}
              >
                {label}
              </Text>
              <Box flex="1" display="flex" alignItems="center" gap="8px">
                <Box flex="1">
                  <ProgressBarWrapper
                    votesPercentage={percentage}
                    barColor={INSIGHTS_CHART_COLORS.darkBlue}
                    bgColor={colors.grey300}
                    height="12px"
                  />
                </Box>
                <Text
                  m="0"
                  fontSize="s"
                  color="textSecondary"
                  textAlign="right"
                  w="60px"
                  style={{ flexShrink: 0 }}
                >
                  {percentage}%
                </Text>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ClusteredIdeaRow;
