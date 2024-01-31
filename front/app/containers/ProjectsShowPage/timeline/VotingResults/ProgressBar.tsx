import React from 'react';

// api
import usePhase from 'api/phases/usePhase';

// components
import {
  Box,
  Text,
  Icon,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
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

interface Props {
  phaseId: string;
  idea: IIdeaData;
}

const ProgressBar = ({ phaseId, idea }: Props) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: phase } = usePhase(phaseId);

  if (!phase) return null;

  const votingMethod = phase.data.attributes.voting_method;
  const baskets =
    votingMethod === 'single_voting'
      ? undefined
      : idea.attributes.baskets_count ?? 0;
  const ideaVotes = idea.attributes.votes_count ?? 0;
  // for budgetting, this is total budget spent?
  const totalVotes = phase?.data.attributes.votes_count;
  const votesPercentage = totalVotes
    ? roundPercentage(ideaVotes, totalVotes)
    : 0;
  const tooltip =
    votingMethod === 'budgeting'
      ? formatMessage(messages.budgetingTooltip)
      : undefined;
  const votes = votingMethod === 'budgeting' ? undefined : ideaVotes;

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
        {baskets !== undefined && (
          <Box
            position="absolute"
            top="0"
            right="0"
            h="28px"
            display="flex"
            alignItems="center"
          >
            <Text mb="0" mt="1px" mr="4px" color="primary">
              {baskets}
            </Text>
            <Icon
              name="user"
              width="20px"
              height="20px"
              mr="12px"
              fill={theme.colors.primary}
            />
          </Box>
        )}
      </Box>
    </Tippy>
  );
};

export default ProgressBar;
