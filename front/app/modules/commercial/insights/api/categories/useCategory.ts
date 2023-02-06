import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import categoryKeys from './keys';
import { CategoryKeys, IInsightsCategory } from './types';

const fetchCategory = (viewId: string, id?: string) =>
  fetcher<IInsightsCategory>({
    path: `/insights/views/${viewId}/categories/${id}`,
    action: 'get',
  });

const useCategory = (viewId: string, id: string) => {
  return useQuery<IInsightsCategory, CLErrors, IInsightsCategory, CategoryKeys>(
    {
      queryKey: categoryKeys.detail(viewId, id),
      queryFn: () => fetchCategory(viewId, id),
    }
  );
};

export default useCategory;
