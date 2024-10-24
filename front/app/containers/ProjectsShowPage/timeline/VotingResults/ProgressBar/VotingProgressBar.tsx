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
  const ideaVotes = 10; // idea.attributes.votes_count; ToDo: Remove hardcoding
  const offlineIdeaVotes = 10; // idea.attributes.manual_votes_amount || 0; ToDo: Remove hardcoding
  const totalIdeaVotes = 20; // idea.attributes.total_votes_count || 0; ToDo: Remove hardcoding
  const totalPhaseVotes = phase.data.attributes.votes_count;
  const totalVotesPercentage = roundPercentage(totalIdeaVotes, totalPhaseVotes);
  const votesOnlinePercentage = roundPercentage(ideaVotes, totalPhaseVotes);
  const manualVotesPercentage = offlineIdeaVotes
    ? roundPercentage(offlineIdeaVotes, totalPhaseVotes)
    : 0;

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
