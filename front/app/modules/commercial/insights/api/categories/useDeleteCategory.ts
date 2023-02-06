import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import categoryKeys from './keys';

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

const useDeleteCategory = ({
  onSuccess,
}: {
  onSuccess?: (categoryId: string) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.list(variables.viewId),
      });
      onSuccess && onSuccess(variables.categoryId);
    },
  });
};

export default useDeleteCategory;
