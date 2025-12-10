import React from 'react';

import { VotingIdeaResult } from 'api/voting_insights/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import ClusteredVotingRow from './ClusteredVotingRow';
import messages from './messages';
import SimpleVotingRow from './SimpleVotingRow';

interface Props {
  idea: VotingIdeaResult;
  maxVotes: number;
  clusterBy?: string;
  demographicKeys?: string[];
  demographicLabels?: string[];
}

const VotingIdeaRow = ({
  idea,
  maxVotes,
  clusterBy,
  demographicKeys,
  demographicLabels,
}: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const title = localize(idea.title_multiloc);
  const isClustered =
    clusterBy && demographicKeys && demographicKeys.length > 0;

  if (!isClustered) {
    return (
      <SimpleVotingRow
        idea={idea}
        title={title}
        maxVotes={maxVotes}
        tooltip={formatMessage(messages.votesTooltip)}
      />
    );
  }

  return (
    <ClusteredVotingRow
      idea={idea}
      title={title}
      demographicKeys={demographicKeys}
      demographicLabels={demographicLabels}
    />
  );
};

export default VotingIdeaRow;
