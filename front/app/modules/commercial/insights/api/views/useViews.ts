import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import viewsKeys from './keys';
import { IInsightsViews, ViewsKeys } from './types';

const fetchViews = () =>
  fetcher<IInsightsViews>({ path: '/insights/views', action: 'get' });

const useViews = () => {
  return useQuery<IInsightsViews, CLErrors, IInsightsViews, ViewsKeys>({
    queryKey: viewsKeys.lists(),
    queryFn: fetchViews,
  });
};

export default useViews;
