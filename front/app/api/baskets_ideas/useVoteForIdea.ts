import { useState, useCallback, useMemo } from 'react';
import { debounce } from 'lodash-es';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IBasketsIdea } from './types';
import basketsKeys from '../baskets/keys';
import basketsIdeasKeys from 'api/baskets_ideas/keys';
import phasesKeys from 'api/phases/keys';
import { IPhaseData } from 'api/phases/types';

interface Params {
  idea_id: string;
  votes: number | null;
  basket_id?: string;
  project_id: string;
  phase_id?: string;
}

export const voteForIdea = async ({ idea_id, votes }: Params) =>
  fetcher<IBasketsIdea>({
    path: `/baskets/ideas/${idea_id}`,
    action: 'put',
    body: { baskets_idea: { idea_id, votes } },
  });

const useVoteForIdeaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<IBasketsIdea, CLErrors, Params>({
    mutationFn: voteForIdea,
    onSuccess: (data, variables) => {
      const basketId = data.data.relationships.basket.data.id;

      queryClient.invalidateQueries({
        queryKey: basketsKeys.item({ id: basketId }),
      });
      queryClient.invalidateQueries({
        queryKey: basketsIdeasKeys.item({ basketId }),
      });

      const { basket_id, project_id, phase_id } = variables;

      const newBasket = basket_id !== basketId;

      if (newBasket) {
        queryClient.invalidateQueries({
          queryKey: phasesKeys.item({ phaseId: phase_id }),
        });

        queryClient.invalidateQueries({
          queryKey: phasesKeys.list({ projectId: project_id }),
        });
      }
    },
  });
};

const useVoteForIdea = (phase?: IPhaseData) => {
  const [processing, setProcessing] = useState(false);
  const { mutateAsync } = useVoteForIdeaMutation();

  const handleVoteForIdea = useCallback(
    async (ideaId: string, votes: number, basketId?: string) => {
      if (!phase) return;

      await mutateAsync({
        idea_id: ideaId,
        votes: votes === 0 ? null : votes,
        basket_id: basketId,
        project_id: phase.relationships.project.data.id,
        phase_id: phase.id,
      });
      setProcessing(false);
    },
    [mutateAsync, phase]
  );

  const handleVoteForIdeaDebounced = useMemo(() => {
    return debounce(handleVoteForIdea, 300);
  }, [handleVoteForIdea]);

  const voteForIdea = useCallback(
    (ideaId: string, votes: number, basketId?: string) => {
      setProcessing(true);
      handleVoteForIdeaDebounced(ideaId, votes, basketId);
    },
    [handleVoteForIdeaDebounced]
  );

  return {
    voteForIdea,
    processing,
  };
};

export default useVoteForIdea;
