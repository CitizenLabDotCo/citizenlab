import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import ideasKeys from 'api/ideas/keys';

import fetcher from 'utils/cl-react-query/fetcher';

interface IDeleteAllResponse {
  data: {
    type: string;
    attributes: {
      deleted: number;
    };
  };
}

const deleteAllIdeas = async (phaseId: string) =>
  fetcher<IDeleteAllResponse>({
    path: `/phases/${phaseId}/importer/delete_all/idea`,
    action: 'delete',
    body: {},
  });

const useDeleteAllOfflineIdeas = () => {
  const queryClient = useQueryClient();
  return useMutation<IDeleteAllResponse, CLErrors, string>({
    mutationFn: deleteAllIdeas,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ideasKeys.lists() });
    },
  });
};

export default useDeleteAllOfflineIdeas;
