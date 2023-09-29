import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import categoriesKeys from '../categories/keys';
import { IInsightsCategories } from '../categories/types';
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
  fetcher<IInsightsCategories>({
    path: `/insights/views/${viewId}/inputs/${inputId}/categories`,
    action: 'post',
    body: { data: categories },
  });

const useAddInputCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addInputCategories,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: inputsKeys.item({
          id: variables.inputId,
        }),
      });
      queryClient.invalidateQueries({
        queryKey: inputsKeys.list({ viewId: variables.viewId }),
      });
      queryClient.invalidateQueries({
        queryKey: categoriesKeys.list({ viewId: variables.viewId }),
      });
      queryClient.invalidateQueries({
        queryKey: statsKeys.item({ viewId: variables.viewId }),
      });
    },
  });
};

export default useAddInputCategories;
