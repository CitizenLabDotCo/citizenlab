import React from 'react';

import { useIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';
import assignMultipleVotesInputMessages from 'components/VoteInputs/multiple/AssignMultipleVotesInput/messages';

import { roundPercentage } from 'utils/math';
import { IIdeaData } from 'api/ideas/types';
import { IPhase } from 'api/phases/types';
import ProgressBarWrapper from './ProgressBarWrapper';
import messages from './messages';

interface Props {
  phase: IPhase;
  idea: IIdeaData;
}

const VotingProgressBar = ({ phase, idea }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const ideaVotes = idea.attributes.votes_count;
  const totalVotes = phase.data.attributes.votes_count;
  const votesPercentage = roundPercentage(ideaVotes, totalVotes);
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
    <ProgressBarWrapper votesPercentage={votesPercentage} tooltip={tooltip}>
      {`${votesPercentage}% (${ideaVotes} ${formatMessage(
        assignMultipleVotesInputMessages.xVotes,
        {
          votes: ideaVotes,
          singular: votingTermSingular,
          plural: votingTermPlural,
        }
      )})`}
    </ProgressBarWrapper>
  );
};

export default VotingProgressBar;
