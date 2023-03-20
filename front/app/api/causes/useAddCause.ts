import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import causeKeys from './keys';
import { ICause, ICauseAdd } from './types';

const addCause = async (requestBody: ICauseAdd) =>
  fetcher<ICause>({
    path: '/causes',
    action: 'post',
    body: { cause: requestBody },
  });

const useAddCause = () => {
  const queryClient = useQueryClient();
  return useMutation<ICause, CLErrors, ICauseAdd>({
    mutationFn: addCause,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: causeKeys.lists() });
    },
  });
};

export default useAddCause;
