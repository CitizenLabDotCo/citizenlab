import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IIdeaVote, INewVoteProperties } from './types';
import ideasKeys from 'api/ideas/keys';

export const addIdeaVote = async ({
  ideaId,
  userId,
  ...requestBody
}: INewVoteProperties) =>
  fetcher<IIdeaVote>({
    path: `/ideas/${ideaId}/votes`,
    action: 'post',
    body: { user_id: userId, ...requestBody },
  });

const useAddIdeaVote = () => {
  const queryClient = useQueryClient();
  return useMutation<IIdeaVote, CLErrors, INewVoteProperties>({
    mutationFn: addIdeaVote,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ideasKeys.item({ id: variables.ideaId }),
      });
    },
  });
};

export default useAddIdeaVote;
