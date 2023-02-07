import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import detectedCategoriesKeys from './keys';
import { IInsightsDetectedCategories, DetectedCategoriesKeys } from './types';

const fetchDetectedCategories = (viewId: string) =>
  fetcher<IInsightsDetectedCategories>({
    path: `/insights/views/${viewId}/detected_categories`,
    action: 'get',
  });

const useDetectedCategories = (viewId: string) => {
  return useQuery<
    IInsightsDetectedCategories,
    CLErrors,
    IInsightsDetectedCategories,
    DetectedCategoriesKeys
  >({
    queryKey: detectedCategoriesKeys.list(viewId),
    queryFn: () => fetchDetectedCategories(viewId),
  });
};

export default useDetectedCategories;
