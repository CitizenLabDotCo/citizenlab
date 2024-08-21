import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import causesKeys from './keys';
import { IIdeaStatus } from './types';

type IReorderIdeaStatus = {
  id: string;
  ordering: number;
};

const reorderIdeaStatus = ({ id, ordering }: IReorderIdeaStatus) =>
  fetcher<IIdeaStatus>({
    path: `/idea_statuses/${id}/reorder`,
    action: 'patch',
    body: { idea_status: { ordering } },
  });

const useReorderIdeaStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<IIdeaStatus, CLErrors, IReorderIdeaStatus>({
    mutationFn: reorderIdeaStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: causesKeys.lists() });
    },
  });
};

export default useReorderIdeaStatus;
