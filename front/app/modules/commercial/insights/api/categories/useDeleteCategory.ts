import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import categoriesKeys from './keys';

const deleteCategory = ({
  viewId,
  categoryId,
}: {
  viewId: string;
  categoryId: string;
}) =>
  fetcher({
    path: `/insights/views/${viewId}/categories/${categoryId}`,
    action: 'delete',
  });

const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: categoriesKeys.list(variables.viewId),
      });
    },
  });
};

export default useDeleteCategory;
