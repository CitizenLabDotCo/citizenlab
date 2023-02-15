import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import viewsKeys from './keys';
import { IInsightsView, ViewsKeys } from './types';

const fetchView = (id: string) =>
  fetcher<IInsightsView>({ path: `/insights/views/${id}`, action: 'get' });

const useView = (id: string) => {
  return useQuery<IInsightsView, CLErrors, IInsightsView, ViewsKeys>({
    queryKey: viewsKeys.item(id),
    queryFn: () => fetchView(id),
  });
};

export default useView;
