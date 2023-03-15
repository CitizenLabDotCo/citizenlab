import { useMutation, useQueryClient } from '@tanstack/react-query';
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
    },
  });
};

export default useUpdateIdeaStatus;
