import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import categoriesKeys from './keys';
import { IInsightsCategory } from './types';

interface AddInsightsCategoryObject {
  viewId: string;
  name: string;
  inputs?: {
    keywords?: string[];
    categories?: string[];
    search?: string;
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

const useAddCategory = ({
  onSuccess,
}: {
  onSuccess?: (categoryId: string) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation<IInsightsCategory, CLErrors, AddInsightsCategoryObject>({
    mutationFn: addCategory,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: categoriesKeys.list(variables.viewId),
      });
      onSuccess && onSuccess(data.data.id);
    },
  });
};

export default useAddCategory;
