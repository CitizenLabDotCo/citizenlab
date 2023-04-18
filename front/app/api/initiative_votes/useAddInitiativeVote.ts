import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IInitiativeVote, INewVoteProperties } from './types';
import initiativesKeys from 'api/initiatives/keys';

export const addInitiativeVote = async ({
  initiativeId,
  ...requestBody
}: INewVoteProperties) =>
  fetcher<IInitiativeVote>({
    path: `/initiatives/${initiativeId}/votes`,
    action: 'post',
    body: requestBody,
  });

const useAddInitiativeVote = () => {
  const queryClient = useQueryClient();
  return useMutation<IInitiativeVote, CLErrors, INewVoteProperties>({
    mutationFn: addInitiativeVote,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: initiativesKeys.item({ id: variables.initiativeId }),
      });
    },
  });
};

export default useAddInitiativeVote;
