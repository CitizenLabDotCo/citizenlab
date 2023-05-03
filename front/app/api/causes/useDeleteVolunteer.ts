import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IVolunteer } from './types';
import causeKeys from './keys';

interface IDeleteVolunteer {
  causeId: string;
  volunteerId: string;
}

export const deleteVolunteer = async ({ causeId, volunteerId }) =>
  fetcher<IVolunteer>({
    path: `/causes/${causeId}/volunteers`,
    action: 'delete',
    body: { volunteerId },
  });

const useDeleteVolunteer = () => {
  const queryClient = useQueryClient();
  return useMutation<IVolunteer, CLErrors, IDeleteVolunteer>({
    mutationFn: deleteVolunteer,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: causeKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: causeKeys.item({ id: variables.causeId }),
      });
    },
  });
};

export default useDeleteVolunteer;
