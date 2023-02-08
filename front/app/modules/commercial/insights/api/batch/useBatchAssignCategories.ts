import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import categoriesKeys from '../categories/keys';
import statsKeys from '../stats/keys';
import inputsKeys from '../inputs/keys';

const unassignCategories = ({
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

const useBatchAssignCategories = ({ onSuccess }: { onSuccess: () => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unassignCategories,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: categoriesKeys.list(variables.viewId),
      });
      queryClient.invalidateQueries({
        queryKey: statsKeys.detail(variables.viewId),
      });
      queryClient.invalidateQueries({
        queryKey: inputsKeys.list(variables.viewId),
      });
      onSuccess();
    },
  });
};

export default useBatchAssignCategories;
