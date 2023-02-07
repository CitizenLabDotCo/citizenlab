import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import viewKeys from './keys';
import { IInsightsView, ViewKeys } from './types';

const fetchView = (id: string) =>
  fetcher<IInsightsView>({ path: `/insights/views/${id}`, action: 'get' });

const useView = (id: string) => {
  return useQuery<IInsightsView, CLErrors, IInsightsView, ViewKeys>({
    queryKey: viewKeys.detail(id),
    queryFn: () => fetchView(id),
  });
};

export default useView;
