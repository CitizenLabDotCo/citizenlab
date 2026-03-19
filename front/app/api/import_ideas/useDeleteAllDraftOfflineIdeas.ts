import { useMutation, useQueryClient } from '@tanstack/react-query';

import ideasKeys from 'api/ideas/keys';

import fetcher from 'utils/cl-react-query/fetcher';

const deleteAllDraftOfflineIdeas = (phaseId: string) =>
  fetcher({
    path: `/phases/${phaseId}/importer/delete_all/idea`,
    action: 'delete',
  });

const useDeleteAllDraftOfflineIdeas = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAllDraftOfflineIdeas,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ideasKeys.lists() });
    },
  });
};

export default useDeleteAllDraftOfflineIdeas;
