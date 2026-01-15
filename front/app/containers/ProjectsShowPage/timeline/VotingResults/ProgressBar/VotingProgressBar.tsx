import React from 'react';

import { IIdeaData } from 'api/ideas/types';
import { IPhase } from 'api/phases/types';
import { getPhaseVoteTermMessage } from 'api/phases/utils';

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

  const xVotesMessage = getPhaseVoteTermMessage(phase.data, {
    vote: assignMultipleVotesInputMessages.xVotes,
    point: assignMultipleVotesInputMessages.xPoints,
    token: assignMultipleVotesInputMessages.xTokens,
    credit: assignMultipleVotesInputMessages.xCredits,
    percent: assignMultipleVotesInputMessages.xPercents,
  });
  const tooltip = formatMessage(messages.votingTooltip);

  return (
    <ProgressBarWrapper
      votesPercentage={votesOnlinePercentage}
      manualVotesPercentage={manualVotesPercentage}
      tooltip={tooltip}
    >
      {`${totalVotesPercentage}% • ${totalIdeaVotes} ${formatMessage(
        xVotesMessage,
        {
          votes: totalIdeaVotes,
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
