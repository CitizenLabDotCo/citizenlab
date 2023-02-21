import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import inputKeys from '../inputs/keys';
import statsKeys from '../stats/keys';
import categoriesKeys from './keys';

const deleteAllCategories = (viewId: string) =>
  fetcher({
    path: `/insights/views/${viewId}/categories`,
    action: 'delete',
  });

const useDeleteAllCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAllCategories,

    onSuccess: (_data, viewId) => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.list(viewId) });
      queryClient.invalidateQueries({ queryKey: statsKeys.item(viewId) });
      queryClient.invalidateQueries({ queryKey: inputKeys.list(viewId) });
    },
  });
};

export default useDeleteAllCategories;
