import React from 'react';

// i18n
import { useIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';
import assignMultipleVotesInputMessages from 'components/VoteInputs/multiple/AssignMultipleVotesInput/messages';

import { roundPercentage } from 'utils/math';
import { IIdeaData } from 'api/ideas/types';
import { IPhase } from 'api/phases/types';
import ProgressBarWrapper from './ProgressBarWrapper';

interface Props {
  phase: IPhase;
  idea: IIdeaData;
}

const VotingProgressBar = ({ phase, idea }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const totalVotes = phase.data.attributes.votes_count;
  const ideaVotes = idea.attributes.votes_count ?? 0;
  const votesPercentage =
    typeof totalVotes === 'number' ? roundPercentage(ideaVotes, totalVotes) : 0;
  const { voting_term_singular_multiloc, voting_term_plural_multiloc } =
    phase.data.attributes;
  const votingTermSingular =
    localize(voting_term_singular_multiloc) ||
    formatMessage(assignMultipleVotesInputMessages.vote).toLowerCase();
  const votingTermPlural =
    localize(voting_term_plural_multiloc) ||
    formatMessage(assignMultipleVotesInputMessages.votes).toLowerCase();
  const tooltip = 'STILL TO CHANGE';

  return (
    <ProgressBarWrapper votesPercentage={votesPercentage} tooltip={tooltip}>
      {ideaVotes ? (
        <>
          {`${votesPercentage}% (${ideaVotes} ${formatMessage(
            assignMultipleVotesInputMessages.xVotes,
            {
              votes: ideaVotes,
              singular: votingTermSingular,
              plural: votingTermPlural,
            }
          )})`}
        </>
      ) : (
        <>{votesPercentage}%</>
      )}
    </ProgressBarWrapper>
  );
};

export default VotingProgressBar;
