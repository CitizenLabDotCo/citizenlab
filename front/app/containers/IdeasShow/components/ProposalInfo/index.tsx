import React from 'react';

import useIdeaStatus from 'api/idea_statuses/useIdeaStatus';
import { IIdea } from 'api/ideas/types';

import Status from './Status';

interface Props {
  idea: IIdea;
  compact?: boolean;
}

const ProposalInfo = ({ idea, compact }: Props) => {
  const { data: ideaStatus } = useIdeaStatus(
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    idea.data.relationships.idea_status?.data?.id || ''
  );

  if (!ideaStatus) return null;

  return (
    <Status idea={idea.data} ideaStatus={ideaStatus.data} compact={compact} />
  );
};

export default ProposalInfo;
