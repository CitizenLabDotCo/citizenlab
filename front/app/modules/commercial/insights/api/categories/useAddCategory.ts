import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import categoriesKeys from './keys';
import { IInsightsCategory } from './types';

interface AddInsightsCategoryObject {
  viewId: string;
  category: {
    name: string;
    inputs?: {
      keywords?: string[];
      categories?: string[];
      search?: string;
    };
  };
}

const addCategory = async ({
  viewId,
  ...requestBody
}: AddInsightsCategoryObject) =>
  fetcher<IInsightsCategory>({
    path: `/insights/views/${viewId}/categories`,
    action: 'post',
    body: requestBody,
  });

const useAddCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<IInsightsCategory, CLErrors, AddInsightsCategoryObject>({
    mutationFn: addCategory,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: categoriesKeys.list(variables.viewId),
      });
    },
  });
};

export default useAddCategory;
