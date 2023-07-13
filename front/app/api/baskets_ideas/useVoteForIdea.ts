import { useState, useCallback, useMemo } from 'react';
import { debounce } from 'lodash-es';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IBasketsIdea } from './types';
import basketsKeys from '../baskets/keys';
import basketsIdeasKeys from 'api/baskets_ideas/keys';

interface Params {
  idea_id: string;
  votes: number | null;
}

export const voteForIdea = async (params: Params) =>
  fetcher<IBasketsIdea>({
    path: `/baskets/ideas/${params.idea_id}`,
    action: 'put',
    body: { baskets_idea: params },
  });

const useVoteForIdeaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<IBasketsIdea, CLErrors, Params>({
    mutationFn: voteForIdea,
    onSuccess: (data) => {
      const basketId = data.data.relationships.basket.data.id;

      queryClient.invalidateQueries({
        queryKey: basketsKeys.item({ id: basketId }),
      });
      queryClient.invalidateQueries({
        queryKey: basketsIdeasKeys.item({ basketId }),
      });
    },
  });
};

const useVoteForIdea = () => {
  const [processing, setProcessing] = useState(false);
  const { mutateAsync } = useVoteForIdeaMutation();

  const handleVoteForIdea = useCallback(
    async (ideaId: string, votes: number) => {
      await mutateAsync({ idea_id: ideaId, votes: votes === 0 ? null : votes });
      setProcessing(false);
    },
    [mutateAsync]
  );

  const handleVoteForIdeaDebounced = useMemo(() => {
    return debounce(handleVoteForIdea, 300);
  }, [handleVoteForIdea]);

  const voteForIdea = useCallback(
    (ideaId: string, votes: number) => {
      setProcessing(true);
      handleVoteForIdeaDebounced(ideaId, votes);
    },
    [handleVoteForIdeaDebounced]
  );

  return {
    voteForIdea,
    processing,
  };
};

export default useVoteForIdea;
