import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import viewKeys from './keys';
import { IInsightsView } from './types';

const createView = async (requestBody: IInsightsViewObject) =>
  fetcher<IInsightsView>({
    path: '/insights/views',
    action: 'create',
    body: requestBody,
  });

interface IInsightsViewObject {
  view: { data_sources: { origin_id: string }[]; name: string };
}

const useCreateView = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation<IInsightsView, CLErrors, IInsightsViewObject>({
    mutationFn: createView,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: viewKeys.lists() });
      onSuccess && onSuccess();
    },
  });
};

export default useCreateView;
