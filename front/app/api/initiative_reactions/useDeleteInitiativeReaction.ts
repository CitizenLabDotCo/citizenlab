import { useMutation, useQueryClient } from '@tanstack/react-query';

import initiativesKeys from 'api/initiatives/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import { IInitiativeReaction } from './types';

const deleteInitiativeReaction = async ({
  reactionId,
}: {
  reactionId: string;
}) =>
  fetcher<IInitiativeReaction>({
    path: `/reactions/${reactionId}`,
    action: 'delete',
  });

const useDeleteInitiativeReaction = ({
  initiativeId,
}: {
  initiativeId: string;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInitiativeReaction,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: initiativesKeys.item({ id: initiativeId }),
      });
    },
  });
};

export default useDeleteInitiativeReaction;
