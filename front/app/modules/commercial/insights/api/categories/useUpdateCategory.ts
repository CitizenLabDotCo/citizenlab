import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import categoryKeys from './keys';
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

const useUpdateCategory = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation<
    IInsightsCategory,
    CLErrors,
    IInsightsCategoryUpdateObject
  >({
    mutationFn: updateCategory,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.list(variables.viewId),
      });
      onSuccess && onSuccess();
    },
  });
};

export default useUpdateCategory;
