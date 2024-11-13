import React from 'react';

import { IIdeaData } from 'api/ideas/types';
import { IPhase } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import assignMultipleVotesInputMessages from 'components/VoteInputs/multiple/AssignMultipleVotesInput/messages';

import { useIntl } from 'utils/cl-intl';
import { roundPercentage } from 'utils/math';

import messages from './messages';
import ProgressBarWrapper from './ProgressBarWrapper';

interface Props {
  phase: IPhase;
  idea: IIdeaData;
}

const VotingProgressBar = ({ phase, idea }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const onlineIdeaVotes = idea.attributes.votes_count;
  const offlineIdeaVotes = idea.attributes.manual_votes_amount;
  const totalIdeaVotes = idea.attributes.total_votes;
  const totalPhaseVotes = phase.data.attributes.total_votes_amount;

  // Calculate percentages
  const totalVotesPercentage = roundPercentage(totalIdeaVotes, totalPhaseVotes);
  const votesOnlinePercentage = roundPercentage(
    onlineIdeaVotes,
    totalPhaseVotes
  );
  const manualVotesPercentage = offlineIdeaVotes
    ? roundPercentage(offlineIdeaVotes, totalPhaseVotes)
    : 0;

  // Voting term
  const { voting_term_singular_multiloc, voting_term_plural_multiloc } =
    phase.data.attributes;
  const votingTermSingular =
    localize(voting_term_singular_multiloc) ||
    formatMessage(assignMultipleVotesInputMessages.vote).toLowerCase();
  const votingTermPlural =
    localize(voting_term_plural_multiloc) ||
    formatMessage(assignMultipleVotesInputMessages.votes).toLowerCase();
  const tooltip = formatMessage(messages.votingTooltip);

  return (
    <ProgressBarWrapper
      votesPercentage={votesOnlinePercentage}
      manualVotesPercentage={manualVotesPercentage}
      tooltip={tooltip}
    >
      {`${totalVotesPercentage}% • ${totalIdeaVotes} ${formatMessage(
        assignMultipleVotesInputMessages.xVotes,
        {
          votes: totalIdeaVotes,
          singular: votingTermSingular,
          plural: votingTermPlural,
        }
      )} ${
        offlineIdeaVotes > 0
          ? formatMessage(assignMultipleVotesInputMessages.numberManualVotes, {
              manualVotes: offlineIdeaVotes,
            })
          : ''
      }`}
    </ProgressBarWrapper>
  );
};

export default VotingProgressBar;
