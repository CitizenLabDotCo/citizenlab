import { useState, useCallback, useMemo } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash-es';
import { CLErrors } from 'typings';

import basketsIdeasKeys from 'api/baskets_ideas/keys';
import phasesKeys from 'api/phases/keys';
import { IPhaseData } from 'api/phases/types';

import fetcher from 'utils/cl-react-query/fetcher';

import basketsKeys from '../baskets/keys';

import { IBasketsIdea } from './types';

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
  const [basketId, setBasketId] = useState<string>();
  const { mutateAsync } = useVoteForIdeaMutation();

  const handleVoteForIdea = useCallback(
    async (ideaId: string, votes: number, existingBasketId?: string) => {
      if (!phase) return;

      const data = await mutateAsync({
        idea_id: ideaId,
        votes: votes === 0 ? null : votes,
        basket_id: existingBasketId,
        project_id: phase.relationships.project.data.id,
        phase_id: phase.id,
      });

      setBasketId(data.data.relationships.basket.data.id);
      setProcessing(false);
    },
    [mutateAsync, phase]
  );

  const handleVoteForIdeaDebounced = useMemo(() => {
    return debounce(handleVoteForIdea, 300);
  }, [handleVoteForIdea]);

  const voteForIdea = useCallback(
    (ideaId: string, votes: number, existingBasketId?: string) => {
      setProcessing(true);
      handleVoteForIdeaDebounced(ideaId, votes, existingBasketId);
    },
    [handleVoteForIdeaDebounced]
  );

  return {
    voteForIdea,
    processing,
    basketId,
  };
};

export default useVoteForIdea;
