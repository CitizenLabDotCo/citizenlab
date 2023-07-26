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
import useVoteForIdea from './useVoteForIdea';

// utils
import { getCurrentParticipationContext } from 'api/phases/utils';
import { isNil } from 'utils/helperUtils';

interface Props {
  projectId?: string;
  children: React.ReactNode;
}

interface VotingInterface {
  getVotes?: (ideaId: string) => number | null;
  setVotes?: (ideaId: string, newVotes: number) => void;
  numberOfVotesCast?: number;
  userHasVotesLeft?: boolean;
  processing?: boolean;
}

const VotingInterfaceContext = createContext<VotingInterface | null>(null);

export const VotingContext = ({ projectId, children }: Props) => {
  const votingInterface = useVotingInterface(projectId);

  return (
    <VotingInterfaceContext.Provider value={votingInterface}>
      {children}
    </VotingInterfaceContext.Provider>
  );
};

const useVotingInterface = (projectId?: string) => {
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  const participationContext = getCurrentParticipationContext(
    project?.data,
    phases?.data
  );

  const [votesPerIdea, setVotesPerIdea] = useState<Record<string, number>>({});

  const { voteForIdea, processing } = useVoteForIdea(participationContext);

  const basketId = participationContext?.relationships?.user_basket?.data?.id;
  const { data: basketIdeas, isFetching: basketIdeasLoading } =
    useBasketsIdeas(basketId);

  const initialLoad =
    basketId &&
    !basketIdeas &&
    basketIdeasLoading &&
    Object.keys(votesPerIdea).length === 0;

  const remoteVotesPerIdea = useMemo<
    Record<string, number> | null | undefined
  >(() => {
    if (initialLoad) return undefined;
    if (!basketIdeas) return null;

    return basketIdeas.data.reduce((acc, basketIdea) => {
      const votes = basketIdea.attributes.votes;
      const ideaId = basketIdea.relationships.idea.data.id;

      return {
        ...acc,
        [ideaId]: votes,
      };
    }, {});
  }, [initialLoad, basketIdeas]);

  const getVotes = useCallback(
    (ideaId: string) => {
      if (ideaId in votesPerIdea) return votesPerIdea[ideaId];

      const loading =
        !participationContext || !!(basketId && !remoteVotesPerIdea);

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

      voteForIdea(ideaId, newVotes, basketId);
    },
    [voteForIdea, basketId]
  );

  const numberOfVotesUserHas =
    participationContext?.attributes.voting_max_total;

  const numberOfVotesCast = useMemo(() => {
    if (remoteVotesPerIdea === undefined) return undefined;

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
    if (numberOfVotesCast === undefined || isNil(numberOfVotesUserHas)) {
      return undefined;
    }

    return numberOfVotesCast < numberOfVotesUserHas;
  }, [numberOfVotesUserHas, numberOfVotesCast]);

  if (!project) return null;

  return {
    getVotes,
    setVotes,
    numberOfVotesCast,
    userHasVotesLeft,
    processing,
  };
};

const useVoting = (): VotingInterface => {
  const votingInterface = useContext(VotingInterfaceContext);

  if (votingInterface === null) {
    return {
      getVotes: undefined,
      setVotes: undefined,
      numberOfVotesCast: undefined,
      userHasVotesLeft: undefined,
      processing: undefined,
    };
  }

  return votingInterface;
};

export default useVoting;
