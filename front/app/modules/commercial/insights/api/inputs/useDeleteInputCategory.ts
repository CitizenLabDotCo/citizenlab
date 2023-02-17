import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import inputsKeys from './keys';
import categoriesKeys from '../categories/keys';
import statsKeys from '../stats/keys';

const deleteInputCategory = ({
  viewId,
  inputId,
  categoryId,
}: {
  viewId: string;
  inputId: string;
  categoryId: string;
}) =>
  fetcher({
    path: `/insights/views/${viewId}/inputs/${inputId}/categories/${categoryId}`,
    action: 'delete',
  });

const useDeleteInputCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInputCategory,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: inputsKeys.item(variables.viewId, variables.inputId),
      });
      queryClient.invalidateQueries({
        queryKey: inputsKeys.list(variables.viewId),
      });
      queryClient.invalidateQueries({
        queryKey: categoriesKeys.list(variables.viewId),
      });
      queryClient.invalidateQueries({
        queryKey: statsKeys.item(variables.viewId),
      });
    },
  });
};

export default useDeleteInputCategory;
