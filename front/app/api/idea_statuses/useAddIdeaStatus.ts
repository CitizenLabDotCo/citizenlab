import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideaStatusKeys from './keys';
import { IIdeaStatus, IIdeaStatusAdd } from './types';

const addIdeaStatus = async (requestBody: IIdeaStatusAdd) =>
  fetcher<IIdeaStatus>({
    path: '/idea_statuses',
    action: 'post',
    body: requestBody,
  });

const useAddIdeaStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<IIdeaStatus, CLErrors, IIdeaStatusAdd>({
    mutationFn: addIdeaStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ideaStatusKeys.lists() });
    },
  });
};

export default useAddIdeaStatus;
