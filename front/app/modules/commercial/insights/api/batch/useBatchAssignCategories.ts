import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import categoriesKeys from '../categories/keys';
import statsKeys from '../stats/keys';
import inputsKeys from '../inputs/keys';

const assignCategories = ({
  viewId,
  inputs,
  categories,
}: {
  viewId: string;
  inputs: string[];
  categories: string[];
}) =>
  fetcher({
    path: `/insights/views/${viewId}/batch/assign_categories`,
    action: 'post',
    body: { inputs, categories },
  });

const useBatchAssignCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignCategories,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: categoriesKeys.list(variables.viewId),
      });
      queryClient.invalidateQueries({
        queryKey: statsKeys.item(variables.viewId),
      });
      queryClient.invalidateQueries({
        queryKey: inputsKeys.list(variables.viewId),
      });
    },
  });
};

export default useBatchAssignCategories;
