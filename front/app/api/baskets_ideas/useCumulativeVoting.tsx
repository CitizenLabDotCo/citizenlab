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
  projectId?: string;
  children: React.ReactNode;
}

interface CumulativeVotingInterface {
  getVotes?: (ideaId: string) => number | null;
  setVotes?: (ideaId: string, newVotes: number) => void;
  numberOfVotesCast?: number;
  userHasVotesLeft?: boolean;
  processing?: boolean;
}

const CumulativeVotingInterfaceContext =
  createContext<CumulativeVotingInterface | null>(null);

export const CumulativeVotingContext = ({ projectId, children }: Props) => {
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  const participationContext = getCurrentParticipationContext(
    project?.data,
    phases?.data
  );

  if (
    !projectId ||
    !(participationContext?.attributes.voting_method === 'multiple_voting')
  ) {
    return <>{children}</>;
  }

  return (
    <CumulativeVotingContextInner projectId={projectId}>
      {children}
    </CumulativeVotingContextInner>
  );
};

interface InnerProps {
  projectId: string;
  children: React.ReactNode;
}

const CumulativeVotingContextInner = ({ projectId, children }: InnerProps) => {
  const cumulativeVotingInterface = useCumulativeVotingInterface(projectId);

  return (
    <CumulativeVotingInterfaceContext.Provider
      value={cumulativeVotingInterface}
    >
      {children}
    </CumulativeVotingInterfaceContext.Provider>
  );
};

const useCumulativeVotingInterface = (projectId: string) => {
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { updateBasket, cancel, processing } = useAssignVote({ projectId });

  const participationContext = getCurrentParticipationContext(
    project?.data,
    phases?.data
  );
  const basketId = participationContext?.relationships?.user_basket?.data?.id;
  const { data: basketIdeas } = useBasketsIdeas(basketId);

  const remoteVotesPerIdea = useMemo<Record<string, number> | null>(() => {
    if (!basketIdeas) return null;

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

      const loading =
        !participationContext || (basketId && !remoteVotesPerIdea);
      if (loading) return null;

      return remoteVotesPerIdea && ideaId in remoteVotesPerIdea
        ? remoteVotesPerIdea[ideaId]
        : 0;
    },
    [votesPerIdea, remoteVotesPerIdea, participationContext, basketId]
  );

  const setVotes = useCallback(
    (ideaId: string, newVotes: number) => {
      setVotesPerIdea((votesPerIdea) => ({
        ...votesPerIdea,
        [ideaId]: newVotes,
      }));

      const remoteVotesForThisIdea =
        remoteVotesPerIdea && ideaId in remoteVotesPerIdea
          ? remoteVotesPerIdea[ideaId]
          : 0;

      const noUpdateNeeded = remoteVotesForThisIdea === newVotes;

      if (noUpdateNeeded) {
        cancel();
      } else {
        updateBasket(ideaId, newVotes);
      }
    },
    [cancel, updateBasket, remoteVotesPerIdea]
  );

  const numberOfVotesUserHas =
    participationContext?.attributes.voting_max_total;

  const numberOfVotesCast = useMemo(() => {
    let numberOfVotesCast = 0;

    const ideaIdsSet = new Set([
      ...Object.keys(votesPerIdea),
      ...(remoteVotesPerIdea ? Object.keys(remoteVotesPerIdea) : []),
    ]);

    ideaIdsSet.forEach((ideaId) => {
      numberOfVotesCast += getVotes(ideaId) ?? 0;
    });

    return numberOfVotesCast;
  }, [getVotes, remoteVotesPerIdea, votesPerIdea]);

  const userHasVotesLeft = useMemo(() => {
    if (!numberOfVotesUserHas) return false;
    return numberOfVotesCast < numberOfVotesUserHas;
  }, [numberOfVotesUserHas, numberOfVotesCast]);

  return {
    getVotes,
    setVotes,
    numberOfVotesCast,
    userHasVotesLeft,
    processing,
  };
};

const useCumulativeVoting = (): CumulativeVotingInterface => {
  const cumulativeVotingInterface = useContext(
    CumulativeVotingInterfaceContext
  );

  if (cumulativeVotingInterface === null) {
    return {
      getVotes: undefined,
      setVotes: undefined,
      numberOfVotesCast: undefined,
      userHasVotesLeft: undefined,
      processing: undefined,
    };
  }

  return cumulativeVotingInterface;
};

export default useCumulativeVoting;
