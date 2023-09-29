import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import categoriesKeys from './keys';
import { CategoriesKeys, IInsightsCategory } from './types';

const fetchCategory = ({ viewId, id }: { viewId: string; id: string }) =>
  fetcher<IInsightsCategory>({
    path: `/insights/views/${viewId}/categories/${id}`,
    action: 'get',
  });

const useCategory = (viewId: string, id: string) => {
  return useQuery<
    IInsightsCategory,
    CLErrors,
    IInsightsCategory,
    CategoriesKeys
  >({
    queryKey: categoriesKeys.item({ id }),
    queryFn: () => fetchCategory({ viewId, id }),
  });
};

export default useCategory;
