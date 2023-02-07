import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import viewKeys from './keys';
import { IInsightsViews, ViewKeys } from './types';

const fetchViews = () =>
  fetcher<IInsightsViews>({ path: '/insights/views', action: 'get' });

const useViews = () => {
  return useQuery<IInsightsViews, CLErrors, IInsightsViews, ViewKeys>({
    queryKey: viewKeys.lists(),
    queryFn: fetchViews,
  });
};

export default useViews;
