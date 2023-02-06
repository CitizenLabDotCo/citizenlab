import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import categoryKeys from './keys';
import { CategoryKeys, IInsightsCategories } from './types';

const fetchCategories = (viewId: string) =>
  fetcher<IInsightsCategories>({
    path: `/insights/views/${viewId}/categories`,
    action: 'get',
  });

const useCategories = (viewId: string) => {
  return useQuery<
    IInsightsCategories,
    CLErrors,
    IInsightsCategories,
    CategoryKeys
  >({
    queryKey: categoryKeys.list(viewId),
    queryFn: () => fetchCategories(viewId),
  });
};

export default useCategories;
