import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IIdeaReaction, INewReactionProperties } from './types';
import ideasKeys from 'api/ideas/keys';

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
      queryClient.invalidateQueries({
        queryKey: ideasKeys.item({ id: variables.ideaId }),
      });
    },
  });
};

export default useAddIdeaReaction;
