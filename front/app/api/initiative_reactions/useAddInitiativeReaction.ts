import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IInitiativeReaction, INewReactionProperties } from './types';
import initiativesKeys from 'api/initiatives/keys';

export const addInitiativeReaction = async ({
  initiativeId,
  ...requestBody
}: INewReactionProperties) =>
  fetcher<IInitiativeReaction>({
    path: `/initiatives/${initiativeId}/reactions`,
    action: 'post',
    body: requestBody,
  });

const useAddInitiativeReaction = () => {
  const queryClient = useQueryClient();
  return useMutation<IInitiativeReaction, CLErrors, INewReactionProperties>({
    mutationFn: addInitiativeReaction,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: initiativesKeys.item({ id: variables.initiativeId }),
      });
    },
  });
};

export default useAddInitiativeReaction;
