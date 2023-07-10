import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import navbarKeys from './keys';
import customPagesKeys from 'api/custom_pages/keys';

const deleteNavbarItem = (id: string) =>
  fetcher({
    path: `/nav_bar_items/${id}`,
    action: 'delete',
  });

const useDeleteNavbarItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNavbarItem,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: navbarKeys.all(),
      });
      queryClient.invalidateQueries({
        queryKey: customPagesKeys.lists(),
      });
    },
  });
};

export default useDeleteNavbarItem;
