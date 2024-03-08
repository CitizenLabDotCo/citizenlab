import { useMutation, useQueryClient } from '@tanstack/react-query';

import navbarKeys from 'api/navbar/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import customPagesKeys from './keys';

const deleteCustomPage = (id: string) =>
  fetcher({
    path: `/static_pages/${id}`,
    action: 'delete',
  });

const useDeleteCustomPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomPage,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: customPagesKeys.lists(),
      });
      queryClient.invalidateQueries({ queryKey: navbarKeys.lists() });
    },
  });
};

export default useDeleteCustomPage;
