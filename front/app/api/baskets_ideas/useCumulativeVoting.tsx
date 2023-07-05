import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useBasketsIdeas from './useBasketsIdeas';
import useAssignVote from './useAssignVote';

// utils
import { getCurrentParticipationContext } from 'api/phases/utils';

interface Props {
  projectId: string;
  children: React.ReactNode;
}

const CumulativeVotingInterfaceContext =
  createContext<CumulativeVotingInterface | null>(null);

export const CumulativeVotingContext = ({ projectId, children }: Props) => {
  const { data: project } = useProjectById(projectId);

  if (!(project?.data.attributes.voting_method === 'multiple_voting')) {
    return <>{children}</>;
  }

  return (
    <CumulativeVotingContextInner projectId={projectId}>
      {children}
    </CumulativeVotingContextInner>
  );
};

const CumulativeVotingContextInner = ({ projectId, children }: Props) => {
  const cumulativeVotingInterface = useCumulativeVotingInterface(projectId);

  return (
    <CumulativeVotingInterfaceContext.Provider
      value={cumulativeVotingInterface}
    >
      {children}
    </CumulativeVotingInterfaceContext.Provider>
  );
};

interface CumulativeVotingInterface {
  getVotes: (ideaId: string) => number;
  setVotes: (ideaId: string, newVotes: number) => void;
  userHasVotesLeft: boolean;
}

const useCumulativeVotingInterface = (
  projectId: string
): CumulativeVotingInterface => {
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

  const numberOfVotesUserHas =
    participationContext?.attributes.voting_max_total;

  const userHasVotesLeft = useMemo(() => {
    if (!numberOfVotesUserHas) return false;

    let numberOfVotesCast = 0;

    const ideaIdsSet = new Set([
      ...Object.keys(votesPerIdea),
      ...Object.keys(remoteVotesPerIdea),
    ]);

    ideaIdsSet.forEach((ideaId) => {
      numberOfVotesCast += getVotes(ideaId);
    });

    return numberOfVotesCast < numberOfVotesUserHas;
  }, [votesPerIdea, remoteVotesPerIdea, getVotes, numberOfVotesUserHas]);

  return {
    getVotes,
    setVotes,
    userHasVotesLeft,
  };
};

const useCumulativeVoting = () => {
  const cumulativeVotingInterface = useContext(
    CumulativeVotingInterfaceContext
  );

  if (cumulativeVotingInterface === null) {
    throw new Error(
      'The useCumulativeVoting hook should only be used within a CumulativeVotingContext.'
    );
  }

  return cumulativeVotingInterface;
};

export default useCumulativeVoting;
