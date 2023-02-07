import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import categoriesKeys from '../categories/keys';
import statsKeys from '../stats/keys';
import inputsKeys from './keys';

const addInputCategories = ({
  viewId,
  inputId,
  categories,
}: {
  viewId: string;
  inputId: string;
  categories: { id: string; type: string }[];
}) =>
  fetcher({
    path: `/insights/views/${viewId}/inputs/${inputId}/categories`,
    action: 'create',
    body: { data: categories },
  });

const useAddInputCategories = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addInputCategories,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: inputsKeys.detail(variables.viewId, variables.inputId),
      });
      queryClient.invalidateQueries({
        queryKey: inputsKeys.list(variables.viewId),
      });
      queryClient.invalidateQueries({
        queryKey: categoriesKeys.list(variables.viewId),
      });
      queryClient.invalidateQueries({
        queryKey: statsKeys.detail(variables.viewId),
      });
      options?.onSuccess && options.onSuccess();
    },
  });
};

export default useAddInputCategories;
