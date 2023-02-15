import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import categoriesKeys from './keys';
import { IInsightsCategory } from './types';

type IInsightsCategoryUpdateObject = {
  viewId: string;
  categoryId: string;
  requestBody: { name: string };
};

const updateCategory = ({
  viewId,
  categoryId,
  requestBody,
}: IInsightsCategoryUpdateObject) =>
  fetcher<IInsightsCategory>({
    path: `/insights/views/${viewId}/categories/${categoryId}`,
    action: 'patch',
    body: requestBody,
  });

const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IInsightsCategory,
    CLErrors,
    IInsightsCategoryUpdateObject
  >({
    mutationFn: updateCategory,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: categoriesKeys.list(variables.viewId),
      });
    },
  });
};

export default useUpdateCategory;
