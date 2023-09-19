import { useState, useCallback, useMemo } from 'react';
import { debounce } from 'lodash-es';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IBasketsIdea } from './types';
import basketsKeys from '../baskets/keys';
import basketsIdeasKeys from 'api/baskets_ideas/keys';
import projectsKeys from 'api/projects/keys';
import phasesKeys from 'api/phases/keys';
import { IProjectData } from 'api/projects/types';
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
      const continuousProject = !phase_id;

      if (newBasket) {
        if (continuousProject) {
          queryClient.invalidateQueries({
            queryKey: projectsKeys.item({ id: project_id }),
          });
        }

        if (!continuousProject) {
          queryClient.invalidateQueries({
            queryKey: phasesKeys.item({ phaseId: phase_id }),
          });

          queryClient.invalidateQueries({
            queryKey: phasesKeys.list({ projectId: project_id }),
          });
        }
      }
    },
  });
};

const useVoteForIdea = (participationContext?: IProjectData | IPhaseData) => {
  const [processing, setProcessing] = useState(false);
  const { mutateAsync } = useVoteForIdeaMutation();

  const handleVoteForIdea = useCallback(
    async (ideaId: string, votes: number, basketId?: string) => {
      if (!participationContext) return;

      await mutateAsync({
        idea_id: ideaId,
        votes: votes === 0 ? null : votes,
        basket_id: basketId,
        project_id:
          participationContext.type === 'project'
            ? participationContext.id
            : participationContext.relationships.project.data.id,
        phase_id:
          participationContext.type === 'phase'
            ? participationContext.id
            : undefined,
      });
      setProcessing(false);
    },
    [mutateAsync, participationContext]
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
