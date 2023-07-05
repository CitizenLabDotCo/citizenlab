import { useState, useMemo, useCallback } from 'react';
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
  const assignVotes = useAssignVote({ projectId });

  const participationContext = getCurrentParticipationContext(
    project?.data,
    phases?.data
  );
  const basketId = participationContext?.relationships?.user_basket?.data?.id;
  const { data: basketIdeas } = useBasketsIdeas(basketId);

  const remoteVotesPerIdea = useMemo<Record<string, number>>(() => {
    if (!basketIdeas) return {};

    return basketIdeas.data.reduce((acc, basketIdea) => {
      const votes = basketIdea.attributes.votes;
      const ideaId = basketIdea.relationships.idea.data.id;

      return {
        ...acc,
        [ideaId]: votes,
      };
    }, {});
  }, [basketIdeas]);

  const [votesPerIdea, setVotesPerIdea] = useState<Record<string, number>>({});

  const getVotes = useCallback(
    (ideaId: string) => {
      if (ideaId in votesPerIdea) return votesPerIdea[ideaId];
      if (ideaId in remoteVotesPerIdea) return remoteVotesPerIdea[ideaId];
      return 0;
    },
    [votesPerIdea, remoteVotesPerIdea]
  );

  const setVotes = useCallback(
    (ideaId: string, newVotes: number) => {
      setVotesPerIdea((votesPerIdea) => ({
        ...votesPerIdea,
        [ideaId]: newVotes,
      }));

      assignVotes(ideaId, newVotes);
    },
    [assignVotes]
  );

  return {
    getVotes,
    setVotes,
  };
};

export default useCumulativeVoting;
