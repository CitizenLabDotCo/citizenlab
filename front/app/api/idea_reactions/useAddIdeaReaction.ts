import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import ideasKeys from 'api/ideas/keys';

import { customerAnalyticsEvents, trackEventByName } from 'utils/analytics';
import fetcher from 'utils/cl-react-query/fetcher';

import { IIdeaReaction, INewReactionProperties } from './types';

export const addIdeaReaction = async ({
  ideaId,
  userId,
  ...requestBody
}: INewReactionProperties) =>
  fetcher<IIdeaReaction>({
    path: `/ideas/${ideaId}/reactions`,
    action: 'post',
    body: { user_id: userId, ...requestBody },
  });

const useAddIdeaReaction = () => {
  const queryClient = useQueryClient();
  return useMutation<IIdeaReaction, CLErrors, INewReactionProperties>({
    mutationFn: addIdeaReaction,
    onSuccess: (_data, variables) => {
      trackEventByName(customerAnalyticsEvents.reactionAdded, {
        idea_id: variables.ideaId,
        mode: variables.mode,
      });

      queryClient.invalidateQueries({
        queryKey: ideasKeys.item({ id: variables.ideaId }),
      });
    },
  });
};

export default useAddIdeaReaction;
