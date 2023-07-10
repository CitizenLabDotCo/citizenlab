import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import causesKeys from './keys';
import { ICause } from './types';

type IReorderCause = {
  id: string;
  ordering: number;
};

const reorderCause = ({ id, ordering }: IReorderCause) =>
  fetcher<ICause>({
    path: `/causes/${id}/reorder`,
    action: 'patch',
    body: { cause: { ordering } },
  });

const useReorderCause = () => {
  const queryClient = useQueryClient();
  return useMutation<ICause, CLErrors, IReorderCause>({
    mutationFn: reorderCause,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: causesKeys.lists() });
    },
  });
};

export default useReorderCause;
