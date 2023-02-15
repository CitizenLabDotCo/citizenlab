import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import viewsKeys from './keys';
import { IInsightsView } from './types';

const createView = async (requestBody: IInsightsViewObject) =>
  fetcher<IInsightsView>({
    path: '/insights/views',
    action: 'post',
    body: requestBody,
  });

interface IInsightsViewObject {
  view: { data_sources: { origin_id: string }[]; name: string };
}

const useCreateView = () => {
  const queryClient = useQueryClient();
  return useMutation<IInsightsView, CLErrors, IInsightsViewObject>({
    mutationFn: createView,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: viewsKeys.lists() });
    },
  });
};

export default useCreateView;
