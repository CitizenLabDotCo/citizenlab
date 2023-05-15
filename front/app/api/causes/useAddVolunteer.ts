import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IVolunteer } from './types';
import causeKeys from './keys';

export const addVolunteer = async (causeId: string) =>
  fetcher<IVolunteer>({
    path: `/causes/${causeId}/volunteers`,
    action: 'post',
    body: null,
  });

const useAddVolunteer = () => {
  const queryClient = useQueryClient();
  return useMutation<IVolunteer, CLErrors, string>({
    mutationFn: addVolunteer,
    onSuccess: (_data, causeId) => {
      queryClient.invalidateQueries({
        queryKey: causeKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: causeKeys.item({ id: causeId }),
      });
    },
  });
};

export default useAddVolunteer;
