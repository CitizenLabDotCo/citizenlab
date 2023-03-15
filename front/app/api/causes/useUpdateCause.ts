import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideaStatusKeys from './keys';
import { ICause, ICauseAdd } from './types';

type IUpdateIdeaStatusObject = {
  id: string;
  requestBody: Partial<ICauseAdd>;
};

const updateCause = ({ id, requestBody }: IUpdateIdeaStatusObject) =>
  fetcher<ICause>({
    path: `/causes/${id}`,
    action: 'patch',
    body: requestBody,
  });

const useUpdateCause = () => {
  const queryClient = useQueryClient();
  return useMutation<ICause, CLErrors, IUpdateIdeaStatusObject>({
    mutationFn: updateCause,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ideaStatusKeys.lists() });
    },
  });
};

export default useUpdateCause;
