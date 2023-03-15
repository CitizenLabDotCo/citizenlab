import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import causeKeys from './keys';
import { ICause, ICauseAdd } from './types';

type IUpdateCauseObject = {
  id: string;
  requestBody: Partial<ICauseAdd>;
};

const updateCause = ({ id, requestBody }: IUpdateCauseObject) =>
  fetcher<ICause>({
    path: `/causes/${id}`,
    action: 'patch',
    body: requestBody,
  });

const useUpdateCause = () => {
  const queryClient = useQueryClient();
  return useMutation<ICause, CLErrors, IUpdateCauseObject>({
    mutationFn: updateCause,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: causeKeys.lists() });
    },
  });
};

export default useUpdateCause;
