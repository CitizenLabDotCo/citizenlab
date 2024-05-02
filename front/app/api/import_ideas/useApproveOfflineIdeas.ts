import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import ideasKeys from 'api/ideas/keys';
import { IIdeaApprovals } from 'api/ideas/types';

import fetcher from 'utils/cl-react-query/fetcher';

const approveIdeas = async (phaseId: string) =>
  fetcher<IIdeaApprovals>({
    path: `/phases/${phaseId}/importer/approve_all/idea`,
    action: 'patch',
    body: {},
  });

const useApproveOfflineIdeas = () => {
  const queryClient = useQueryClient();
  return useMutation<IIdeaApprovals, CLErrors, string>({
    mutationFn: approveIdeas,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ideasKeys.lists() });
    },
  });
};

export default useApproveOfflineIdeas;
