import React from 'react';
// components
import { Box, Text, stylingConsts } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

// styling
import { useTheme } from 'styled-components';
import { transparentize } from 'polished';

// i18n
import { useIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';
import messages from './messages';
import assignMultipleVotesInputMessages from 'components/VoteInputs/multiple/AssignMultipleVotesInput/messages';

import { roundPercentage } from 'utils/math';
import { IIdeaData } from 'api/ideas/types';
import { IPhase } from 'api/phases/types';

interface Props {
  phase: IPhase;
  idea: IIdeaData;
}

const ProgressBar = ({ phase, idea }: Props) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const votingMethod = phase.data.attributes.voting_method;

  const ideaVotes = idea.attributes.votes_count ?? 0;
  const votes = votingMethod === 'budgeting' ? undefined : ideaVotes;

  const totalVotes = phase.data.attributes.votes_count;

  const votesPercentage =
    typeof totalVotes === 'number' ? roundPercentage(ideaVotes, totalVotes) : 0;

  const tooltip =
    votingMethod === 'budgeting'
      ? // Content is currently wrong. It's not the average percentage of people's budgets spent on this option
        // Rather, it's the percentage of the total budget spent on this option
        formatMessage(messages.budgetingTooltip)
      : undefined;

  // Voting terms
  const { voting_term_singular_multiloc, voting_term_plural_multiloc } =
    phase.data.attributes;
  const votingTermSingular =
    localize(voting_term_singular_multiloc) ||
    formatMessage(assignMultipleVotesInputMessages.vote).toLowerCase();
  const votingTermPlural =
    localize(voting_term_plural_multiloc) ||
    formatMessage(assignMultipleVotesInputMessages.votes).toLowerCase();

  return (
    <Tippy
      disabled={!tooltip}
      content={tooltip}
      interactive={true}
      placement="bottom"
    >
      <Box
        w="100%"
        h="28px"
        borderRadius={stylingConsts.borderRadius}
        bgColor={transparentize(0.9, theme.colors.tenantPrimary)}
        position="relative"
      >
        <Box
          w={`${votesPercentage}%`}
          h="100%"
          bgColor={transparentize(0.75, theme.colors.primary)}
          borderRadius={stylingConsts.borderRadius}
        />
        <Box
          position="absolute"
          left="0"
          top="0"
          h="28px"
          display="flex"
          alignItems="center"
        >
          <Text
            m="0"
            color="tenantPrimary"
            ml="12px"
            fontSize="s"
            fontWeight="bold"
          >
            {votes ? (
              <>
                {`${votesPercentage}% (${votes} ${formatMessage(
                  assignMultipleVotesInputMessages.xVotes,
                  {
                    votes,
                    singular: votingTermSingular,
                    plural: votingTermPlural,
                  }
                )})`}
              </>
            ) : (
              <>{votesPercentage}%</>
            )}
          </Text>
        </Box>
      </Box>
    </Tippy>
  );
};

export default ProgressBar;
