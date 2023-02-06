import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import categoryKeys from './keys';
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
    action: 'create',
    body: requestBody,
  });

const useAddCategory = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation<IInsightsCategory, CLErrors, AddInsightsCategoryObject>({
    mutationFn: addCategory,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.list(variables.viewId),
      });
      onSuccess && onSuccess();
    },
  });
};

export default useAddCategory;
