import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import adminPublicationsKeys from './keys';
import { IAdminPublication } from './types';

type IReorderAdminPublication = {
  id: string;
  ordering: number;
};

const reorderAdminPublication = ({ id, ordering }: IReorderAdminPublication) =>
  fetcher<IAdminPublication>({
    path: `/admin_publications/${id}/reorder`,
    action: 'patch',
    body: { admin_publication: { ordering } },
  });

const useReorderAdminPublication = () => {
  const queryClient = useQueryClient();
  return useMutation<IAdminPublication, CLErrors, IReorderAdminPublication>({
    mutationFn: reorderAdminPublication,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminPublicationsKeys.lists(),
      });
    },
  });
};

export default useReorderAdminPublication;
