import { useMutation, useQueryClient } from '@tanstack/react-query';
import ideaFilterCountsKeys from 'api/ideas_filter_counts/keys';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideaStatusKeys from './keys';
import { IIdeaStatus, IIdeaStatusUpdate } from './types';

type IUpdateIdeaStatusObject = {
  id: string;
  requestBody: IIdeaStatusUpdate;
};

const updateIdeaStatus = ({ id, requestBody }: IUpdateIdeaStatusObject) =>
  fetcher<IIdeaStatus>({
    path: `/idea_statuses/${id}`,
    action: 'patch',
    body: requestBody,
  });

const useUpdateIdeaStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<IIdeaStatus, CLErrors, IUpdateIdeaStatusObject>({
    mutationFn: updateIdeaStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ideaStatusKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ideaFilterCountsKeys.all() });
    },
  });
};

export default useUpdateIdeaStatus;
