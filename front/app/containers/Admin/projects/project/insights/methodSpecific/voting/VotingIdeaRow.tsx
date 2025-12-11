import React from 'react';

import { VotingIdeaResult } from 'api/voting_insights/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import SimpleVotingRow from './SimpleVotingRow';

interface Props {
  idea: VotingIdeaResult;
  maxVotes: number;
}

const VotingIdeaRow = ({ idea, maxVotes }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const title = localize(idea.title_multiloc);

  return (
    <SimpleVotingRow
      idea={idea}
      title={title}
      maxVotes={maxVotes}
      tooltip={formatMessage(messages.votesTooltip)}
    />
  );
};

export default VotingIdeaRow;
