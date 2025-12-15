import React from 'react';

import { VotingIdeaResult } from 'api/voting_insights/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import SimpleVotingRow from './SimpleVotingRow';

interface Props {
  idea: VotingIdeaResult;
}

const VotingIdeaRow = ({ idea }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const title = localize(idea.title_multiloc);

  return (
    <SimpleVotingRow
      idea={idea}
      title={title}
      tooltip={formatMessage(messages.votesTooltip)}
    />
  );
};

export default VotingIdeaRow;
