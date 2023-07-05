import { useState, useCallback } from 'react';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useBasketsIdeas from './useBasketsIdeas';
import useAssignVote from './useAssignVote';

// utils
import { getCurrentParticipationContext } from 'api/phases/utils';

interface Props {
  projectId: string;
}

const useCumulativeVoting = ({ projectId }: Props) => {
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  const participationContext = getCurrentParticipationContext(
    project?.data,
    phases?.data
  );
  const basketId = participationContext?.relationships?.user_basket?.data?.id;
  const { data: basketIdeas } = useBasketsIdeas(basketId);

  const assignVote = useAssignVote({ projectId });

  const [votesPerIdea, setVotesPerIdea] = useState();

  const;

  return {
    votesPerIdea,
  };
};

export default useCumulativeVoting;
